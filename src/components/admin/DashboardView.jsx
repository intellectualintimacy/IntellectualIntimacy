import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CreditCard, Users, Mail, Loader2, TrendingUp, 
  TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign,
  Activity, Target, Zap, Clock, MapPin, Star, Filter,
  Download, RefreshCw, BarChart3, PieChart, Eye, AlertCircle,
  CheckCircle, XCircle, Sparkles, Award, Flame, Crown
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('30d'); // 7d, 30d, 90d, 1y
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    avgTicketPrice: 0,
    conversionRate: 0,
    upcomingEvents: 0
  });
  const [trends, setTrends] = useState({
    events: 0,
    reservations: 0,
    users: 0,
    subscribers: 0,
    revenue: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      switch(timeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch all events
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      // Fetch all reservations
      const { data: allReservations } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalEvents = allEvents?.length || 0;
      const totalReservations = allReservations?.length || 0;

      // Calculate revenue
      const totalRevenue = (allEvents || []).reduce((sum, e) => {
        const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
        return sum + (registered * (Number(e.price) || 0));
      }, 0);

      const totalTicketsSold = (allEvents || []).reduce((sum, e) => {
        return sum + ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0));
      }, 0);

      const avgTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

      const totalCapacity = (allEvents || []).reduce((sum, e) => sum + (Number(e.capacity) || 0), 0);
      const conversionRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

      const upcomingEventsCount = (allEvents || []).filter(e => {
        if (!e.date) return false;
        return new Date(e.date) >= new Date();
      }).length;

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscribers
      const { count: subscribersCount } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      setStats({
        totalEvents,
        totalReservations,
        totalUsers: usersCount || 0,
        activeSubscribers: subscribersCount || 0,
        totalRevenue,
        avgTicketPrice,
        conversionRate,
        upcomingEvents: upcomingEventsCount
      });

      // Calculate trends (mock for now - you'd compare with previous period)
      setTrends({
        events: 12,
        reservations: 23,
        users: 8,
        subscribers: 15,
        revenue: 18
      });

      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5);

      setUpcomingEvents(events || []);

      // Fetch recent reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentReservations(reservations || []);

      // Calculate top events by bookings
      const eventsWithBookings = (allEvents || []).map(e => ({
        ...e,
        bookings: (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0),
        revenue: ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)) * (Number(e.price) || 0)
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      setTopEvents(eventsWithBookings);

      // Calculate revenue by category
      const categoryRevenue = {};
      (allEvents || []).forEach(e => {
        const category = e.category || 'General';
        const revenue = ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)) * (Number(e.price) || 0);
        categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
      });

      const revenueArray = Object.entries(categoryRevenue).map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      })).sort((a, b) => b.revenue - a.revenue);

      setRevenueByCategory(revenueArray);

    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: `R${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-950/30',
      textColor: 'text-green-700 dark:text-green-400',
      change: trends.revenue,
      subtitle: `R${stats.avgTicketPrice.toFixed(0)} avg ticket`
    },
    { 
      label: 'Total Events', 
      value: stats.totalEvents, 
      icon: Calendar, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
      textColor: 'text-blue-700 dark:text-blue-400',
      change: trends.events,
      subtitle: `${stats.upcomingEvents} upcoming`
    },
    { 
      label: 'Total Bookings', 
      value: stats.totalReservations, 
      icon: CreditCard, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-950/30',
      textColor: 'text-purple-700 dark:text-purple-400',
      change: trends.reservations,
      subtitle: `${stats.conversionRate.toFixed(1)}% conversion`
    },
    { 
      label: 'Community', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-100 dark:bg-amber-950/30',
      textColor: 'text-amber-700 dark:text-amber-400',
      change: trends.users,
      subtitle: `${stats.activeSubscribers} subscribers`
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-light mb-2 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Dashboard <span className="elegant-text">Overview</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Welcome back! Here's what's happening with your community.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="feature-card p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`icon-elegant ${stat.bgColor} ${stat.textColor}`}>
                <stat.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-light ${
                stat.change >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {stat.value}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400 font-light mb-1">{stat.label}</div>
            <div className="text-xs text-stone-500 dark:text-stone-500 font-light">{stat.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
              <Target className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Conversion Rate
            </h3>
          </div>
          <div className="text-4xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {stats.conversionRate.toFixed(1)}%
          </div>
          <div className="h-2 bg-stone-200 dark:bg-stone-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
            Of total capacity is being utilized
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
              <Activity className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Engagement
            </h3>
          </div>
          <div className="text-4xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {stats.totalReservations > 0 ? (stats.totalReservations / stats.totalEvents).toFixed(1) : 0}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light mb-3">
            Average bookings per event
          </p>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <span className="text-xs text-stone-600 dark:text-stone-400 font-light">
              Strong community interest
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
              <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Growth Rate
            </h3>
          </div>
          <div className="text-4xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            +{((trends.events + trends.reservations + trends.users) / 3).toFixed(0)}%
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light mb-3">
            Average growth across all metrics
          </p>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <span className="text-xs text-stone-600 dark:text-stone-400 font-light">
              Momentum is building
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Revenue by <span className="elegant-text">Category</span>
            </h3>
            <PieChart className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
            {revenueByCategory.length === 0 ? (
              <p className="text-stone-500 text-center py-8 font-light">No revenue data yet</p>
            ) : (
              revenueByCategory.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        i === 0 ? 'bg-amber-500' :
                        i === 1 ? 'bg-blue-500' :
                        i === 2 ? 'bg-purple-500' :
                        i === 3 ? 'bg-green-500' : 'bg-stone-400'
                      }`} />
                      <span className="text-sm font-light text-stone-900 dark:text-stone-50">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-light text-stone-900 dark:text-stone-50">
                        R{cat.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
                        {cat.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        i === 0 ? 'bg-amber-500' :
                        i === 1 ? 'bg-blue-500' :
                        i === 2 ? 'bg-purple-500' :
                        i === 3 ? 'bg-green-500' : 'bg-stone-400'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Performing Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Top <span className="elegant-text">Events</span>
            </h3>
            <Award className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            {topEvents.length === 0 ? (
              <p className="text-stone-500 text-center py-8 font-light">No events yet</p>
            ) : (
              topEvents.map((event, i) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
                >
                  <div className={`w-8 h-8 flex items-center justify-center font-light text-sm ${
                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                    i === 1 ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400' :
                    i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                    'bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-500'
                  }`}>
                    {i === 0 && <Crown className="w-4 h-4" strokeWidth={1.5} />}
                    {i !== 0 && `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-light text-sm text-stone-900 dark:text-stone-50 truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
                      {event.bookings} bookings • {event.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-light text-stone-900 dark:text-stone-50">
                      R{event.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Upcoming <span className="elegant-text">Events</span>
            </h3>
            <Calendar className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-stone-500 dark:text-stone-400 font-light">No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map(event => {
                const registered = (Number(event.capacity) || 0) - (Number(event.available_spots) || Number(event.capacity) || 0);
                const fillPercentage = event.capacity ? (registered / event.capacity) * 100 : 0;
                
                return (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-4 p-3 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-center text-white font-light">
                      <div className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-xl">{new Date(event.date).getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-light text-sm text-stone-900 dark:text-stone-50 mb-1 truncate">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 font-light">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {event.start_time || 'TBA'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" strokeWidth={1.5} />
                          <span className="truncate max-w-[150px]">{event.location || 'TBA'}</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-light text-stone-900 dark:text-stone-50">
                        {registered}/{event.capacity || 0}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
                        {fillPercentage.toFixed(0)}% full
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Recent Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Recent <span className="elegant-text">Bookings</span>
            </h3>
            <CreditCard className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            {recentReservations.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-stone-500 dark:text-stone-400 font-light">No reservations yet</p>
              </div>
            ) : (
              recentReservations.map(res => (
                <div 
                  key={res.id} 
                  className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center text-sm font-light text-stone-700 dark:text-stone-300">
                    {res.user_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-light text-sm text-stone-900 dark:text-stone-50 truncate">
                      {res.user_name || 'Guest User'}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-500 font-light truncate">
                      {res.user_email || 'No email'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 text-xs font-light ${
                      res.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                        : res.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      {res.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="feature-card p-6 mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Key <span className="elegant-text">Insights</span>
          </h3>
          <Eye className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Insight 1 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 flex-shrink-0">
                <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                  Best Performing Category
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                  {revenueByCategory[0]?.category || 'N/A'} generates the most revenue at R{(revenueByCategory[0]?.revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 flex-shrink-0">
                <Users className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                  Community Growth
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                  {stats.activeSubscribers} active subscribers with {trends.subscribers >= 0 ? '+' : ''}{trends.subscribers}% growth this period
                </p>
              </div>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 flex-shrink-0">
                <Target className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                  Booking Efficiency
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                  {stats.conversionRate.toFixed(1)}% of total event capacity is being utilized effectively
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-3">
            Recommended Actions
          </h4>
          <div className="space-y-2">
            {stats.conversionRate < 50 && (
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 font-light">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Consider reducing event capacity or increasing marketing efforts to improve conversion rate</span>
              </div>
            )}
            {stats.upcomingEvents === 0 && (
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 font-light">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>No upcoming events scheduled. Create new events to maintain community engagement</span>
              </div>
            )}
            {stats.activeSubscribers > 0 && recentReservations.length === 0 && (
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 font-light">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Send a newsletter to your {stats.activeSubscribers} subscribers about upcoming events</span>
              </div>
            )}
            {stats.conversionRate >= 50 && stats.upcomingEvents > 0 && (
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 font-light">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Great work! Your events are performing well. Keep up the momentum</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="feature-card p-4 text-center">
          <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            R{stats.avgTicketPrice.toFixed(0)}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Avg Ticket Price</div>
        </div>
        
        <div className="feature-card p-4 text-center">
          <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {stats.totalEvents > 0 ? (stats.totalReservations / stats.totalEvents).toFixed(1) : 0}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Bookings per Event</div>
        </div>
        
        <div className="feature-card p-4 text-center">
          <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {((trends.events + trends.reservations + trends.users + trends.subscribers) / 4).toFixed(0)}%
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Overall Growth</div>
        </div>
        
        <div className="feature-card p-4 text-center">
          <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {stats.upcomingEvents}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 font-light">Upcoming Events</div>
        </div>
      </motion.div>
    </motion.div>
  );
}