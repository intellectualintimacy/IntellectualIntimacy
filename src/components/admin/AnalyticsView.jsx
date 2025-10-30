// src/components/admin/AnalyticsView.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Calendar, Users, DollarSign, 
  Target, Activity, BarChart3, PieChart, Zap, Award,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analytics, setAnalytics] = useState({
    overview: {},
    revenue: {},
    events: {},
    users: {},
    conversion: {},
    topEvents: [],
    recentActivity: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
      const now = new Date();
      const daysAgo = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const startDateStr = startDate.toISOString();

      // Fetch all data
      const [eventsRes, reservationsRes, usersRes, subscribersRes] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('reservations').select('*').gte('created_at', startDateStr),
        supabase.from('profiles').select('*').gte('created_at', startDateStr),
        supabase.from('newsletter_subscribers').select('*').gte('subscribed_at', startDateStr)
      ]);

      const events = eventsRes.data || [];
      const reservations = reservationsRes.data || [];
      const users = usersRes.data || [];
      const subscribers = subscribersRes.data || [];

      // Calculate previous period for comparison
      const prevStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const prevStartDateStr = prevStartDate.toISOString();
      
      const [prevReservationsRes, prevUsersRes] = await Promise.all([
        supabase.from('reservations').select('*').gte('created_at', prevStartDateStr).lt('created_at', startDateStr),
        supabase.from('profiles').select('*').gte('created_at', prevStartDateStr).lt('created_at', startDateStr)
      ]);

      const prevReservations = prevReservationsRes.data || [];
      const prevUsers = prevUsersRes.data || [];

      // Calculate metrics
      const totalRevenue = reservations.reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0);
      const prevRevenue = prevReservations.reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0);
      const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;

      const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
      const conversionRate = reservations.length > 0 ? (confirmedReservations / reservations.length * 100) : 0;

      const upcomingEvents = events.filter(e => new Date(e.date) >= now).length;
      const pastEvents = events.filter(e => new Date(e.date) < now).length;

      // Top performing events
      const eventReservations = {};
      reservations.forEach(r => {
        eventReservations[r.event_id] = (eventReservations[r.event_id] || 0) + 1;
      });

      const topEvents = events
        .map(e => ({
          ...e,
          reservationCount: eventReservations[e.id] || 0,
          attendanceRate: e.capacity > 0 ? ((e.capacity - (e.available_spots || 0)) / e.capacity * 100) : 0
        }))
        .sort((a, b) => b.reservationCount - a.reservationCount)
        .slice(0, 5);

      // Growth calculations
      const userGrowth = prevUsers.length > 0 ? ((users.length - prevUsers.length) / prevUsers.length * 100) : 0;
      const reservationGrowth = prevReservations.length > 0 ? ((reservations.length - prevReservations.length) / prevReservations.length * 100) : 0;

      setAnalytics({
        overview: {
          totalRevenue,
          revenueChange,
          totalReservations: reservations.length,
          reservationGrowth,
          newUsers: users.length,
          userGrowth,
          newSubscribers: subscribers.length
        },
        revenue: {
          total: totalRevenue,
          average: reservations.length > 0 ? totalRevenue / reservations.length : 0,
          completed: reservations.filter(r => r.payment_status === 'completed').length,
          pending: reservations.filter(r => r.payment_status === 'pending').length
        },
        events: {
          upcoming: upcomingEvents,
          past: pastEvents,
          total: events.length,
          avgCapacity: events.length > 0 ? events.reduce((sum, e) => sum + (e.capacity || 0), 0) / events.length : 0
        },
        users: {
          new: users.length,
          growth: userGrowth,
          total: (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count || 0
        },
        conversion: {
          rate: conversionRate,
          confirmed: confirmedReservations,
          pending: reservations.filter(r => r.status === 'pending').length,
          cancelled: reservations.filter(r => r.status === 'cancelled').length
        },
        topEvents,
        recentActivity: reservations.slice(0, 10)
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
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
          <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Analytics & Insights
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Track your community's growth and engagement
          </p>
        </div>
        <div className="flex gap-2">
          {['7days', '30days', '90days'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              analytics.overview.revenueChange >= 0 ? 'text-white' : 'text-red-200'
            }`}>
              {analytics.overview.revenueChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(analytics.overview.revenueChange).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-light mb-1">
            R {analytics.overview.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-white/80">Total Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              analytics.overview.reservationGrowth >= 0 ? 'text-white' : 'text-red-200'
            }`}>
              {analytics.overview.reservationGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(analytics.overview.reservationGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-light mb-1">
            {analytics.overview.totalReservations}
          </div>
          <div className="text-sm text-white/80">Reservations</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              analytics.overview.userGrowth >= 0 ? 'text-white' : 'text-red-200'
            }`}>
              {analytics.overview.userGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(analytics.overview.userGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-light mb-1">
            {analytics.overview.newUsers}
          </div>
          <div className="text-sm text-white/80">New Users</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-white">
              <Zap className="w-4 h-4" />
              Live
            </div>
          </div>
          <div className="text-3xl font-light mb-1">
            {analytics.conversion.rate.toFixed(1)}%
          </div>
          <div className="text-sm text-white/80">Conversion Rate</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Revenue Breakdown
            </h3>
            <PieChart className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Completed</span>
                <span className="text-sm font-medium">
                  R {(analytics.revenue.total * (analytics.revenue.completed / (analytics.overview.totalReservations || 1))).toFixed(0)}
                </span>
              </div>
              <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  style={{ width: `${(analytics.revenue.completed / (analytics.overview.totalReservations || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Pending</span>
                <span className="text-sm font-medium">
                  R {(analytics.revenue.total * (analytics.revenue.pending / (analytics.overview.totalReservations || 1))).toFixed(0)}
                </span>
              </div>
              <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"
                  style={{ width: `${(analytics.revenue.pending / (analytics.overview.totalReservations || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average per Reservation</span>
                <span className="text-xl font-light">R {analytics.revenue.average.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Statistics */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Event Statistics
            </h3>
            <BarChart3 className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-light">{analytics.events.upcoming}</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">Upcoming Events</div>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-light">{analytics.events.past}</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">Past Events</div>
              </div>
              <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <Activity className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </div>
            </div>
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Capacity</span>
                <span className="text-xl font-light">{Math.round(analytics.events.avgCapacity)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Conversion Funnel
            </h3>
            <TrendingUp className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Confirmed</span>
                <span className="text-sm font-medium">{analytics.conversion.confirmed}</span>
              </div>
              <div className="h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-medium">
                {((analytics.conversion.confirmed / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Pending</span>
                <span className="text-sm font-medium">{analytics.conversion.pending}</span>
              </div>
              <div 
                className="h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ width: `${(analytics.conversion.pending / (analytics.overview.totalReservations || 1)) * 100}%` }}
              >
                {((analytics.conversion.pending / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Cancelled</span>
                <span className="text-sm font-medium">{analytics.conversion.cancelled}</span>
              </div>
              <div 
                className="h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                style={{ width: `${(analytics.conversion.cancelled / (analytics.overview.totalReservations || 1)) * 100}%` }}
              >
                {((analytics.conversion.cancelled / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Events */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Top Performing Events
          </h3>
          <Award className="w-5 h-5 text-stone-400" />
        </div>
        {analytics.topEvents.length === 0 ? (
          <div className="text-center py-8 text-stone-500">No event data available</div>
        ) : (
          <div className="space-y-4">
            {analytics.topEvents.map((event, index) => (
              <div 
                key={event.id}
                className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-stone-300 to-stone-400 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                  'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                    <span>{event.reservationCount} reservations</span>
                    <span>•</span>
                    <span>{event.attendanceRate.toFixed(0)}% capacity</span>
                    <span>•</span>
                    <span>{event.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-light">{event.reservationCount}</div>
                  <div className="text-xs text-stone-500">bookings</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}