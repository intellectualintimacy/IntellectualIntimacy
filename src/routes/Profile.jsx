import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Shield, Award, Heart, 
  Edit2, Save, X, Camera, CheckCircle, Clock, Users, Book,
  Activity, Flame, Target, TrendingUp, Gift, Star, Zap,
  FileText, AlertCircle, Crown, Sparkles, Loader
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [roleDetails, setRoleDetails] = useState(null);
  const [circuit, setCircuit] = useState(null);
  const [branch, setBranch] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, thisMonth: 0 });
  const [eventRsvps, setEventRsvps] = useState([]);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [prayerLogs, setPrayerLogs] = useState([]);
  const [todayPrayers, setTodayPrayers] = useState([]);
  const [prayerStats, setPrayerStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalPrayers: 0,
    thisWeekCount: 0,
    thisMonthCount: 0,
    completionRate: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loggingPrayer, setLoggingPrayer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      
      setProfile(profileData);
      setTempProfile(profileData);

      // Fetch circuit if exists
      if (profileData.home_circuit_id) {
        const { data: circuitData } = await supabase
          .from('circuits')
          .select('*')
          .eq('id', profileData.home_circuit_id)
          .single();
        
        setCircuit(circuitData);
      }

      // Fetch branch if exists
      if (profileData.home_branch_id) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('*')
          .eq('id', profileData.home_branch_id)
          .single();
        
        setBranch(branchData);
      }

      // Fetch role-specific details
      await fetchRoleDetails(profileData.id, profileData.role);

      // Fetch attendance stats
      await fetchAttendanceStats(profileData.id);

      // Fetch event RSVPs
      await fetchEventRsvps(profileData.id);

      // Fetch prayer requests
      await fetchPrayerRequests(profileData.id);

      // Fetch prayer logs
      await fetchPrayerLogs(profileData.id);

    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleDetails = async (profileId, role) => {
    try {
      if (role === 'reverend') {
        const { data, error } = await supabase
          .from('reverends')
          .select(`
            *,
            current_circuit:circuits!current_circuit_id(name),
            current_mission_branch:branches!current_mission_branch_id(name)
          `)
          .eq('profile_id', profileId)
          .single();

        if (!error && data) setRoleDetails(data);
      } else if (role === 'deacon') {
        const { data, error } = await supabase
          .from('deacons')
          .select(`
            *,
            branch:branches(name)
          `)
          .eq('profile_id', profileId)
          .single();

        if (!error && data) setRoleDetails(data);
      } else if (role === 'deaconess') {
        const { data, error } = await supabase
          .from('deaconesses')
          .select(`
            *,
            branch:branches(name)
          `)
          .eq('profile_id', profileId)
          .single();

        if (!error && data) setRoleDetails(data);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const fetchAttendanceStats = async (profileId) => {
    try {
      // Only count attendance for church events (events table)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          branch:branches!inner(
            id,
            name
          )
        `)
        .eq('member_id', profileId);

      if (attendanceError) throw attendanceError;

      const totalCount = attendanceData?.length || 0;

      // This month's attendance
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const thisMonthAttendance = attendanceData?.filter(a => 
        new Date(a.service_date) >= firstDayOfMonth
      ) || [];

      setAttendanceStats({
        total: totalCount,
        thisMonth: thisMonthAttendance.length
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchEventRsvps = async (profileId) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(
            title,
            event_date,
            event_time,
            location
          )
        `)
        .eq('member_id', profileId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) setEventRsvps(data);
    } catch (error) {
      console.error('Error fetching event RSVPs:', error);
    }
  };

  const fetchPrayerRequests = async (profileId) => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('member_id', profileId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) setPrayerRequests(data);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    }
  };

  const fetchPrayerLogs = async (profileId) => {
    try {
      // First, ensure prayer_logs table exists, if not we'll create it via this query attempt
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('member_id', profileId)
        .order('prayer_date', { ascending: false });

      if (!error && data) {
        setPrayerLogs(data);
        calculatePrayerStats(data);
        getTodayPrayers(data);
      } else if (error && error.code === '42P01') {
        // Table doesn't exist yet - this is fine, we'll handle it
        console.log('Prayer logs table not yet created');
      }
    } catch (error) {
      console.error('Error fetching prayer logs:', error);
    }
  };

  const getTodayPrayers = (logs) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.prayer_date === today);
    const prayedTimes = todayLogs.map(log => log.prayer_time);
    setTodayPrayers(prayedTimes);
  };

  const calculatePrayerStats = (logs) => {
    if (!logs || logs.length === 0) {
      setPrayerStats({
        currentStreak: 0,
        longestStreak: 0,
        totalPrayers: 0,
        thisWeekCount: 0,
        thisMonthCount: 0,
        completionRate: 0
      });
      return;
    }

    // Total prayers
    const totalPrayers = logs.length;

    // This week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCount = logs.filter(log => 
      new Date(log.prayer_date) >= oneWeekAgo
    ).length;

    // This month's count
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const thisMonthCount = logs.filter(log => 
      new Date(log.prayer_date) >= firstDayOfMonth
    ).length;

    // Calculate streaks (consecutive days with at least one prayer)
    const dateMap = {};
    logs.forEach(log => {
      const date = log.prayer_date;
      if (!dateMap[date]) {
        dateMap[date] = [];
      }
      dateMap[date].push(log.prayer_time);
    });

    const sortedDates = Object.keys(dateMap).sort().reverse();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    let checkingCurrent = true;

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      
      if (i === 0) {
        tempStreak = 1;
        if (currentDate === today || isYesterday(currentDate)) {
          currentStreak = 1;
        } else {
          checkingCurrent = false;
        }
      } else {
        const prevDate = sortedDates[i - 1];
        if (isConsecutiveDay(currentDate, prevDate)) {
          tempStreak++;
          if (checkingCurrent) {
            currentStreak++;
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
          checkingCurrent = false;
        }
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate completion rate (days with at least 1 prayer / total days since join)
    const daysSinceJoin = Math.ceil((new Date() - firstDayOfMonth) / (1000 * 60 * 60 * 24));
    const daysWithPrayer = Object.keys(dateMap).length;
    const completionRate = daysSinceJoin > 0 ? Math.round((daysWithPrayer / daysSinceJoin) * 100) : 0;

    setPrayerStats({
      currentStreak,
      longestStreak,
      totalPrayers,
      thisWeekCount,
      thisMonthCount,
      completionRate
    });
  };

  const isYesterday = (dateString) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === yesterday.toISOString().split('T')[0];
  };

  const isConsecutiveDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  const logPrayer = async (prayerTime) => {
    if (!profile) return;

    try {
      setLoggingPrayer(true);

      const today = new Date().toISOString().split('T')[0];

      // Check if already logged for this time today
      const { data: existing } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('member_id', profile.id)
        .eq('prayer_date', today)
        .eq('prayer_time', prayerTime)
        .single();

      if (existing) {
        alert('You have already logged this prayer time for today!');
        return;
      }

      // Insert prayer log
      const { error } = await supabase
        .from('prayer_logs')
        .insert({
          member_id: profile.id,
          prayer_date: today,
          prayer_time: prayerTime,
          created_at: new Date().toISOString()
        });

      if (error) {
        // If table doesn't exist, show helpful message
        if (error.code === '42P01') {
          alert('Prayer logging feature is being set up. Please contact your administrator.');
        } else {
          throw error;
        }
        return;
      }

      // Refresh prayer logs
      await fetchPrayerLogs(profile.id);
      
      alert(`Prayer time ${prayerTime} logged successfully!`);
    } catch (error) {
      console.error('Error logging prayer:', error);
      alert('Failed to log prayer. Please try again.');
    } finally {
      setLoggingPrayer(false);
    }
  };

  const prayerTimes = [
    { time: '12:00', standard: '5:00 AM', description: 'Morning thanksgiving - End of night, beginning of day' },
    { time: '1:00', standard: '6:00 AM', description: 'First hour prayer - Before daily work', hymn: 'Song 55: "Hlalani nilinde ngokuba niyokufa"' },
    { time: '3:00', standard: '8:00 AM', description: 'Family prayer - Everyone in their house' },
    { time: '4:00', standard: '9:00 AM', description: 'Crucifixion remembrance', hymn: 'Song 36: "uJesu Bambethela Emthini"' },
    { time: '6:00', standard: '11:00 AM', description: 'Midday prayer - Wherever you are' },
    { time: '6:30', standard: '11:30 AM', description: 'Hour of darkness - Jesus on the cross', hymn: 'Song 12: "Wafa wafa Jesu"' },
    { time: '9:00', standard: '2:00 PM', description: 'Afternoon prayer - Wherever you are' },
    { time: '10:00', standard: '3:00 PM', description: 'Holy Spirit calling', hymn: 'Songs 51, 149, 52' },
    { time: '12:00', standard: '5:00 PM', description: 'Twelfth hour - Final hour of day' },
    { time: '12:30', standard: '5:30 PM', description: "Joseph's burial of Jesus", hymn: 'Song 19: "Nanguya uJesu esekukhanyeni"' },
    { time: '3:00', standard: '8:00 PM', description: 'Evening prayer - Keep His will', hymn: 'Song 35: "Gcinani Intando yakhe"' },
    { time: '4:00', standard: '9:00 PM', description: 'Night blessing - Before sleep', hymn: 'Song 67: "Nkulukulu Baba Nkosi Yami"' }
  ];

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: tempProfile.first_name,
          last_name: tempProfile.last_name,
          phone_number: tempProfile.phone_number,
          address: tempProfile.address,
          city: tempProfile.city,
          postal_code: tempProfile.postal_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(tempProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  const getRoleIcon = () => {
    if (!profile) return <User className="w-6 h-6 text-slate-400" />;
    switch(profile.role) {
      case 'reverend': return <Shield className="w-6 h-6 text-blue-400" />;
      case 'deacon': return <Award className="w-6 h-6 text-cyan-400" />;
      case 'deaconess': return <Award className="w-6 h-6 text-purple-400" />;
      default: return <User className="w-6 h-6 text-slate-400" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!profile) return 'from-slate-600 to-slate-800';
    switch(profile.role) {
      case 'reverend': return 'from-blue-600 to-blue-800';
      case 'deacon': return 'from-cyan-600 to-cyan-800';
      case 'deaconess': return 'from-purple-600 to-purple-800';
      default: return 'from-slate-600 to-slate-800';
    }
  };

  const getRoleTitle = () => {
    if (!profile) return 'Member';
    switch(profile.role) {
      case 'reverend': return roleDetails?.rank ? roleDetails.rank.replace('_', ' ').toUpperCase() : 'Reverend';
      case 'deacon': return 'Deacon';
      case 'deaconess': return 'Deaconess';
      default: return 'Member';
    }
  };

  const calculateMembershipYears = () => {
    if (!profile?.join_date) return 0;
    const joinYear = new Date(profile.join_date).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - joinYear;
  };

  const calculatePrayerStreak = () => {
    return prayerStats.currentStreak;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'spiritual', name: 'Spiritual Journey', icon: Flame },
    ...(profile?.role === 'reverend' || profile?.role === 'deacon' || profile?.role === 'deaconess' 
      ? [{ id: 'ministry', name: 'Ministry', icon: Book }] 
      : []
    ),
    { id: 'activity', name: 'Activity', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-950 shadow-2xl flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl text-slate-600">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 transition-all shadow-lg opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Name & Role */}
              <div className="text-center md:text-left mb-4 md:mb-8">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-4xl font-light text-white">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.role !== 'member' && (
                    <div className={`p-2 bg-gradient-to-br ${getRoleBadgeColor()} shadow-lg`}>
                      {getRoleIcon()}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start text-sm">
                  <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 tracking-wider">
                    {getRoleTitle()}
                  </span>
                  {profile.membership_number && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Member #{profile.membership_number}</span>
                    </>
                  )}
                  {profile.join_date && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{calculateMembershipYears()} years of service</span>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="ml-auto mb-8 hidden md:block">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-blue-500/50 text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-24 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm tracking-wider transition-all relative ${
                  activeTab === tab.id
                    ? 'text-white bg-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-blue-400" />
                  <h2 className="text-2xl font-light text-white">Personal Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">FIRST NAME</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">LAST NAME</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">EMAIL</label>
                    <p className="text-white">{profile.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">PHONE NUMBER</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={tempProfile.phone_number || ''}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.phone_number || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">DATE OF BIRTH</label>
                    <p className="text-white">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">GENDER</label>
                    <p className="text-white capitalize">{profile.gender || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">MARITAL STATUS</label>
                    <p className="text-white capitalize">{profile.marital_status || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">ID NUMBER</label>
                    <p className="text-white">{profile.id_number || 'Not provided'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">ADDRESS</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">CITY</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">POSTAL CODE</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.postal_code || ''}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.postal_code || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Church Information Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <h2 className="text-2xl font-light text-white">Church Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">HOME CIRCUIT</label>
                    <p className="text-white">{circuit?.name || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">HOME BRANCH</label>
                    <p className="text-white">{branch?.name || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">JOIN DATE</label>
                    <p className="text-white">{profile.join_date ? new Date(profile.join_date).toLocaleDateString() : 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">BAPTISM DATE</label>
                    <p className="text-white">{profile.baptism_date ? new Date(profile.baptism_date).toLocaleDateString() : 'Not provided'}</p>
                  </div>

                  {profile.role === 'reverend' && roleDetails && (
                    <>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">RANK</label>
                        <p className="text-white capitalize">{roleDetails.rank?.replace('_', ' ')}</p>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-2">ORDINATION DATE</label>
                        <p className="text-white">{roleDetails.ordination_date ? new Date(roleDetails.ordination_date).toLocaleDateString() : 'Not provided'}</p>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-2">CURRENT ASSIGNMENT</label>
                        <p className="text-white">{roleDetails.current_circuit?.name || 'Not assigned'}</p>
                      </div>

                      {roleDetails.specializations && roleDetails.specializations.length > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm text-slate-400 mb-2">SPECIALIZATIONS</label>
                          <div className="flex flex-wrap gap-2">
                            {roleDetails.specializations.map((spec, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-900/30 border border-blue-700/30 text-blue-400 text-sm">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {(profile.role === 'deacon' || profile.role === 'deaconess') && roleDetails && (
                    <>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">ORDINATION DATE</label>
                        <p className="text-white">{roleDetails.ordination_date ? new Date(roleDetails.ordination_date).toLocaleDateString() : 'Not provided'}</p>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-2">SERVICE BRANCH</label>
                        <p className="text-white">{roleDetails.branch?.name || 'Not assigned'}</p>
                      </div>

                      {roleDetails.responsibilities && (
                        <div className="md:col-span-2">
                          <label className="block text-sm text-slate-400 mb-2">RESPONSIBILITIES</label>
                          <p className="text-white">{roleDetails.responsibilities}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Quick Info */}
            <div className="space-y-6">
              {/* Membership Stats */}
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-800/30 p-6">
                <h3 className="text-lg font-light text-white mb-4">Membership Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Years of Service</span>
                    <span className="text-2xl font-light text-blue-400">{calculateMembershipYears()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Services Attended</span>
                    <span className="text-2xl font-light text-blue-400">{attendanceStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">This Month</span>
                    <span className="text-2xl font-light text-green-400">{attendanceStats.thisMonth}</span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-6">
                <h3 className="text-lg font-light text-white mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {profile.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Active Member</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">Inactive</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {profile.email_verified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Email Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm">Email Not Verified</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {profile.verified_member ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Verified Member</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm">Pending Verification</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900/60 border border-slate-800 p-6">
                <h3 className="text-lg font-light text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm text-left transition-all flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    View My Events
                  </button>
                  <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm text-left transition-all flex items-center gap-3">
                    <Book className="w-4 h-4 text-blue-400" />
                    Submit Prayer Request
                  </button>
                  <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm text-left transition-all flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Share Testimony
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spiritual Journey Tab */}
        {activeTab === 'spiritual' && (
          <div className="space-y-8">
            {/* Prayer Tracking Dashboard */}
            <div className="bg-gradient-to-br from-orange-900/20 to-slate-900 border border-orange-800/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-6 h-6 text-orange-400" />
                <h2 className="text-3xl font-light text-white">The Twelve Times of Prayer</h2>
              </div>

              <p className="text-slate-300 mb-6 leading-relaxed">
                Just as God gave the Israelites instruction to pray three times a day (Daniel 6:10-13), 
                and Muslims five times a day, God who sent uMqalisi gave him through the revelation of 
                Jesus Christ twelve times of prayer. "Are there not twelve hours of daylight?" (John 11:9)
              </p>

              {/* Prayer Stats Overview */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/60 border border-slate-800 p-6 text-center">
                  <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-3xl font-light text-orange-400 mb-1">{prayerStats.currentStreak}</div>
                  <div className="text-slate-400 text-sm">Current Streak</div>
                  <div className="text-xs text-slate-500 mt-1">Consecutive days</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-light text-yellow-400 mb-1">{prayerStats.longestStreak}</div>
                  <div className="text-slate-400 text-sm">Longest Streak</div>
                  <div className="text-xs text-slate-500 mt-1">Personal best</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-light text-green-400 mb-1">{prayerStats.thisWeekCount}</div>
                  <div className="text-slate-400 text-sm">This Week</div>
                  <div className="text-xs text-slate-500 mt-1">Prayers logged</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 text-center">
                  <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-light text-blue-400 mb-1">{prayerStats.completionRate}%</div>
                  <div className="text-slate-400 text-sm">Consistency</div>
                  <div className="text-xs text-slate-500 mt-1">This month</div>
                </div>
              </div>

              {/* Today's Progress */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-light text-white">Today's Prayer Progress</h3>
                  <span className="text-slate-400 text-sm">{todayPrayers.length} of 12 prayers logged</span>
                </div>
                
                <div className="w-full bg-slate-800 h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-600 to-orange-400 h-3 transition-all duration-500"
                    style={{ width: `${(todayPrayers.length / 12) * 100}%` }}
                  />
                </div>

                {todayPrayers.length === 12 && (
                  <div className="bg-green-900/30 border border-green-700/30 p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-300 text-sm">
                      Praise God! You've completed all twelve prayers today! 🙏
                    </p>
                  </div>
                )}

                {todayPrayers.length < 12 && todayPrayers.length > 0 && (
                  <div className="bg-blue-900/30 border border-blue-700/30 p-4">
                    <p className="text-blue-300 text-sm">
                      Keep going! You're doing great. {12 - todayPrayers.length} more {12 - todayPrayers.length === 1 ? 'prayer' : 'prayers'} to go today.
                    </p>
                  </div>
                )}

                {todayPrayers.length === 0 && (
                  <div className="bg-amber-900/30 border border-amber-700/30 p-4">
                    <p className="text-amber-300 text-sm">
                      Start your spiritual journey today by logging your prayers as you complete them.
                    </p>
                  </div>
                )}
              </div>

              {/* Prayer Times Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prayerTimes.map((prayer, index) => {
                  const isLogged = todayPrayers.includes(prayer.time);
                  
                  return (
                    <div 
                      key={index} 
                      className={`border p-5 transition-all ${
                        isLogged 
                          ? 'bg-green-900/30 border-green-700/50' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-orange-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-orange-400 font-mono text-lg">{prayer.time}</div>
                          <div className="text-slate-500 text-xs">{prayer.standard}</div>
                        </div>
                        {isLogged ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      <p className="text-slate-300 text-sm mb-3">{prayer.description}</p>

                      {prayer.hymn && (
                        <p className="text-orange-300 text-xs italic mb-3 pb-3 border-b border-slate-700">
                          {prayer.hymn}
                        </p>
                      )}

                      {!isLogged && (
                        <button
                          onClick={() => logPrayer(prayer.time)}
                          disabled={loggingPrayer}
                          className="w-full px-4 py-2 bg-orange-600/80 hover:bg-orange-600 text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loggingPrayer ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Logging...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Log Prayer
                            </>
                          )}
                        </button>
                      )}

                      {isLogged && (
                        <div className="w-full px-4 py-2 bg-green-900/40 border border-green-700/30 text-green-400 text-sm text-center">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Encouragement Message */}
              <div className="mt-6 bg-blue-900/20 border border-blue-800/30 p-6">
                <p className="text-blue-300 text-sm text-center italic">
                  "If anyone—young or old—was unable to join in all twelve prayers, they still have the 
                  opportunity to pray to the Lord when they return home after work or school."
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Prayer Life Insights */}
              <div className="bg-slate-900/60 border border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h2 className="text-2xl font-light text-white">Prayer Insights</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Total Prayers Logged</span>
                      <span className="text-2xl font-light text-white">{prayerStats.totalPrayers}</span>
                    </div>
                    <div className="text-xs text-slate-500">Lifetime count</div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">This Month</span>
                      <span className="text-2xl font-light text-blue-400">{prayerStats.thisMonthCount}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Average: {Math.round(prayerStats.thisMonthCount / new Date().getDate())} per day
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">This Week</span>
                      <span className="text-2xl font-light text-green-400">{prayerStats.thisWeekCount}</span>
                    </div>
                    <div className="text-xs text-slate-500">Last 7 days</div>
                  </div>
                </div>

                {/* Spiritual Level Badge */}
                <div className="mt-6 bg-gradient-to-br from-purple-900/30 to-slate-900 border border-purple-800/30 p-6 text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-light text-white mb-2">Your Spiritual Level</h3>
                  <div className="text-2xl font-light text-purple-400 mb-2">
                    {prayerStats.currentStreak >= 30 ? 'Prayer Warrior' :
                     prayerStats.currentStreak >= 14 ? 'Devoted Servant' :
                     prayerStats.currentStreak >= 7 ? 'Faithful Follower' :
                     prayerStats.totalPrayers >= 50 ? 'Growing in Faith' :
                     'Beginning Journey'}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {prayerStats.currentStreak >= 30 ? 'Outstanding! 30+ day streak!' :
                     prayerStats.currentStreak >= 14 ? 'Excellent! 2+ week streak!' :
                     prayerStats.currentStreak >= 7 ? 'Great! 1+ week streak!' :
                     prayerStats.totalPrayers >= 50 ? 'Keep building your prayer habit' :
                     'Start your prayer journey today'}
                  </p>
                </div>
              </div>

              {/* Recent Prayer Requests */}
              <div className="bg-slate-900/60 border border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <h2 className="text-2xl font-light text-white">Prayer Requests</h2>
                </div>

                {prayerRequests.length > 0 ? (
                  <div className="space-y-4">
                    {prayerRequests.map(request => (
                      <div key={request.id} className="bg-slate-800/50 border border-slate-700 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white text-sm font-medium">{request.title}</h4>
                          <span className={`text-xs px-2 py-1 whitespace-nowrap ${
                            request.status === 'answered' 
                              ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                              : request.status === 'open'
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-700/30'
                              : 'bg-slate-700/30 text-slate-400'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-2 mb-3">{request.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          <span>{request.prayer_count} prayers</span>
                          <span>•</span>
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        {request.is_urgent && (
                          <div className="mt-2 flex items-center gap-1 text-red-400 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            Urgent
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">No prayer requests yet</p>
                    <button className="mt-4 px-6 py-2 bg-pink-600/80 hover:bg-pink-600 text-white text-sm transition-all">
                      Submit Prayer Request
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Spiritual Milestones */}
            <div className="bg-slate-900/60 border border-slate-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-2xl font-light text-white">Spiritual Milestones</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {profile.baptism_date && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700">
                    <div className="w-10 h-10 bg-blue-900/30 border border-blue-700/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-light mb-1">Baptized</h3>
                      <p className="text-slate-400 text-sm">{new Date(profile.baptism_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {profile.join_date && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700">
                    <div className="w-10 h-10 bg-green-900/30 border border-green-700/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-light mb-1">Joined Church</h3>
                      <p className="text-slate-400 text-sm">{new Date(profile.join_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {profile.role === 'reverend' && roleDetails?.ordination_date && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700">
                    <div className="w-10 h-10 bg-purple-900/30 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-light mb-1">Ordained as Reverend</h3>
                      <p className="text-slate-400 text-sm">{new Date(roleDetails.ordination_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {(profile.role === 'deacon' || profile.role === 'deaconess') && roleDetails?.ordination_date && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700">
                    <div className="w-10 h-10 bg-cyan-900/30 border border-cyan-700/30 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-light mb-1">Ordained as {profile.role === 'deacon' ? 'Deacon' : 'Deaconess'}</h3>
                      <p className="text-slate-400 text-sm">{new Date(roleDetails.ordination_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {calculateMembershipYears() >= 5 && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700">
                    <div className="w-10 h-10 bg-yellow-900/30 border border-yellow-700/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-light mb-1">Faithful Service</h3>
                      <p className="text-slate-400 text-sm">{calculateMembershipYears()} years of dedication</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ministry Tab */}
        {activeTab === 'ministry' && (
          <div className="space-y-8">
            {profile.role !== 'member' && roleDetails && (
              <>
                {/* Ministry Overview */}
                <div className="bg-slate-900/60 border border-slate-800 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h2 className="text-2xl font-light text-white">Ministry Overview</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">POSITION</label>
                      <p className="text-white text-lg">{getRoleTitle()}</p>
                    </div>

                    {profile.role === 'reverend' && (
                      <>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">CURRENT ASSIGNMENT</label>
                          <p className="text-white">{roleDetails.current_circuit?.name || 'Not assigned'}</p>
                        </div>

                        {roleDetails.assignment_start_date && (
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">ASSIGNMENT START</label>
                            <p className="text-white">{new Date(roleDetails.assignment_start_date).toLocaleDateString()}</p>
                          </div>
                        )}

                        {roleDetails.assignment_end_date && (
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">ASSIGNMENT END</label>
                            <p className="text-white">{new Date(roleDetails.assignment_end_date).toLocaleDateString()}</p>
                          </div>
                        )}

                        {roleDetails.bio && (
                          <div className="md:col-span-2">
                            <label className="block text-sm text-slate-400 mb-2">BIOGRAPHY</label>
                            <p className="text-white leading-relaxed">{roleDetails.bio}</p>
                          </div>
                        )}
                      </>
                    )}

                    {(profile.role === 'deacon' || profile.role === 'deaconess') && (
                      <>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">SERVICE BRANCH</label>
                          <p className="text-white">{roleDetails.branch?.name || 'Not assigned'}</p>
                        </div>

                        {roleDetails.responsibilities && (
                          <div className="md:col-span-2">
                            <label className="block text-sm text-slate-400 mb-2">RESPONSIBILITIES</label>
                            <p className="text-white leading-relaxed">{roleDetails.responsibilities}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                {profile.role === 'reverend' && roleDetails.specializations && roleDetails.specializations.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Target className="w-5 h-5 text-blue-400" />
                      <h2 className="text-2xl font-light text-white">Specializations</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {roleDetails.specializations.map((spec, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-800/30 p-6 text-center">
                          <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                          <p className="text-white font-light">{spec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Message for regular members */}
            {profile.role === 'member' && (
              <div className="bg-slate-900/60 border border-slate-800 p-12 text-center">
                <Book className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl font-light text-white mb-4">Ministry Information</h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Ministry details are available for church leadership roles. If you're interested in serving in a specific ministry, 
                  please contact your branch leadership or speak with a reverend.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Events */}
            <div className="bg-slate-900/60 border border-slate-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl font-light text-white">My Events</h2>
              </div>

              {eventRsvps.length > 0 ? (
                <div className="space-y-4">
                  {eventRsvps.map(rsvp => (
                    <div key={rsvp.id} className="bg-slate-800/50 border border-slate-700 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-light">{rsvp.event.title}</h3>
                        <span className={`text-xs px-2 py-1 ${
                          rsvp.status === 'attending'
                            ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                            : rsvp.status === 'maybe'
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'
                            : 'bg-red-900/30 text-red-400 border border-red-700/30'
                        }`}>
                          {rsvp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(rsvp.event.event_date).toLocaleDateString()}
                        </div>
                        {rsvp.event.event_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rsvp.event.event_time}
                          </div>
                        )}
                      </div>
                      {rsvp.event.location && (
                        <div className="flex items-center gap-1 text-slate-400 text-sm mt-2">
                          <MapPin className="w-3 h-3" />
                          {rsvp.event.location}
                        </div>
                      )}
                      {rsvp.number_of_guests > 0 && (
                        <div className="flex items-center gap-1 text-slate-400 text-sm mt-2">
                          <Users className="w-3 h-3" />
                          +{rsvp.number_of_guests} guests
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">No upcoming events</p>
                </div>
              )}
            </div>

            {/* Attendance History */}
            <div className="bg-slate-900/60 border border-slate-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-green-400" />
                <h2 className="text-2xl font-light text-white">Attendance Summary</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-900/30 to-slate-900 border border-green-800/30 p-6">
                  <div className="text-center">
                    <div className="text-5xl font-light text-green-400 mb-2">{attendanceStats.total}</div>
                    <div className="text-slate-400">Total Services Attended</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 p-4 text-center">
                    <div className="text-2xl font-light text-blue-400 mb-1">{attendanceStats.thisMonth}</div>
                    <div className="text-slate-400 text-sm">This Month</div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 p-4 text-center">
                    <div className="text-2xl font-light text-purple-400 mb-1">
                      {Math.round((attendanceStats.thisMonth / 4) * 100)}%
                    </div>
                    <div className="text-slate-400 text-sm">Attendance Rate</div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/30 p-4">
                  <p className="text-blue-300 text-sm text-center">
                    <strong>Keep up the good work!</strong> Regular attendance strengthens your spiritual journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;