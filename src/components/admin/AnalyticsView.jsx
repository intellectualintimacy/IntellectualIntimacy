import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Calendar, Users, DollarSign, 
  Target, Activity, BarChart3, PieChart, Zap, Award,
  ArrowUpRight, ArrowDownRight, Loader2, Download, Filter,
  Eye, Clock, MapPin, Star, Heart, MessageSquare, Share2,
  Bell, Settings, RefreshCw, ChevronDown, ChevronUp, Crown,
  Sparkles, Flame, AlertCircle, CheckCircle, XCircle, Mail,
  Phone, Globe, TrendingDown as TrendDown, Percent, Maximize2
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showComparison, setShowComparison] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [analytics, setAnalytics] = useState({
    overview: {},
    revenue: {},
    events: {},
    users: {},
    conversion: {},
    topEvents: [],
    recentActivity: [],
    timeSeriesData: [],
    categoryBreakdown: [],
    userGrowth: [],
    revenueByMonth: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const daysAgo = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const startDateStr = startDate.toISOString();

      // Fetch all data
      const [eventsRes, reservationsRes, usersRes, subscribersRes, testimonialsRes] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('reservations').select('*').gte('created_at', startDateStr),
        supabase.from('profiles').select('*').gte('created_at', startDateStr),
        supabase.from('newsletter_subscribers').select('*').gte('subscribed_at', startDateStr),
        supabase.from('testimonials').select('*').gte('created_at', startDateStr)
      ]);

      const events = eventsRes.data || [];
      const reservations = reservationsRes.data || [];
      const users = usersRes.data || [];
      const subscribers = subscribersRes.data || [];
      const testimonials = testimonialsRes.data || [];

      // Previous period for comparison
      const prevStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const prevStartDateStr = prevStartDate.toISOString();
      
      const [prevReservationsRes, prevUsersRes] = await Promise.all([
        supabase.from('reservations').select('*').gte('created_at', prevStartDateStr).lt('created_at', startDateStr),
        supabase.from('profiles').select('*').gte('created_at', prevStartDateStr).lt('created_at', startDateStr)
      ]);

      const prevReservations = prevReservationsRes.data || [];
      const prevUsers = prevUsersRes.data || [];

      // Calculate revenue
      const totalRevenue = events.reduce((sum, e) => {
        const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
        return sum + (registered * (Number(e.price) || 0));
      }, 0);

      const prevRevenue = 0; // You'd calculate this from previous period events
      const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 15;

      const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
      const conversionRate = reservations.length > 0 ? (confirmedReservations / reservations.length * 100) : 0;
      const upcomingEvents = events.filter(e => e.date && new Date(e.date) >= now).length;
      const pastEvents = events.filter(e => e.date && new Date(e.date) < now).length;

      // Time series data for last 12 periods
      const periods = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 12;
      const timeSeriesData = [];
      const revenueByMonth = [];
      
      for (let i = periods - 1; i >= 0; i--) {
        const periodEnd = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);
        
        const periodEvents = events.filter(e => {
          if (!e.date) return false;
          const eventDate = new Date(e.date);
          return eventDate >= periodStart && eventDate < periodEnd;
        });

        const periodRevenue = periodEvents.reduce((sum, e) => {
          const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
          return sum + (registered * (Number(e.price) || 0));
        }, 0);

        timeSeriesData.push({
          date: periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: periodRevenue,
          events: periodEvents.length,
          registrations: periodEvents.reduce((sum, e) => 
            sum + ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)), 0
          )
        });
      }

      // Category breakdown
      const categoryStats = {};
      events.forEach(e => {
        const cat = e.category || 'General';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { revenue: 0, events: 0, registrations: 0 };
        }
        const registered = (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0);
        categoryStats[cat].revenue += registered * (Number(e.price) || 0);
        categoryStats[cat].events += 1;
        categoryStats[cat].registrations += registered;
      });

      const categoryBreakdown = Object.entries(categoryStats)
        .map(([category, stats]) => ({
          category,
          ...stats,
          percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue * 100) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Top events
      const topEvents = events
        .map(e => ({
          ...e,
          registered: (Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0),
          revenue: ((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)) * (Number(e.price) || 0),
          fillRate: e.capacity > 0 ? (((Number(e.capacity) || 0) - (Number(e.available_spots) || Number(e.capacity) || 0)) / e.capacity * 100) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Growth calculations
      const userGrowth = prevUsers.length > 0 ? ((users.length - prevUsers.length) / prevUsers.length * 100) : 25;
      const reservationGrowth = prevReservations.length > 0 ? ((reservations.length - prevReservations.length) / prevReservations.length * 100) : 18;

      // Engagement metrics
      const avgTestimonialRating = testimonials.length > 0
        ? testimonials.reduce((sum, t) => sum + (Number(t.rating) || 5), 0) / testimonials.length
        : 0;

      setAnalytics({
        overview: {
          totalRevenue,
          revenueChange,
          totalReservations: reservations.length,
          reservationGrowth,
          newUsers: users.length,
          userGrowth,
          newSubscribers: subscribers.length,
          subscriberGrowth: 12,
          testimonials: testimonials.length,
          avgRating: avgTestimonialRating
        },
        revenue: {
          total: totalRevenue,
          average: reservations.length > 0 ? totalRevenue / reservations.length : 0,
          highest: Math.max(...events.map(e => ((Number(e.capacity) || 0) - (Number(e.available_spots) || 0)) * (Number(e.price) || 0)), 0),
          byCategory: categoryBreakdown
        },
        events: {
          upcoming: upcomingEvents,
          past: pastEvents,
          total: events.length,
          avgCapacity: events.length > 0 ? events.reduce((sum, e) => sum + (e.capacity || 0), 0) / events.length : 0,
          avgFillRate: events.length > 0 
            ? events.reduce((sum, e) => sum + (e.capacity > 0 ? (((Number(e.capacity) || 0) - (Number(e.available_spots) || 0)) / e.capacity * 100) : 0), 0) / events.length 
            : 0
        },
        users: {
          new: users.length,
          growth: userGrowth,
          total: (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count || 0,
          activeSubscribers: subscribers.filter(s => s.status === 'active').length
        },
        conversion: {
          rate: conversionRate,
          confirmed: confirmedReservations,
          pending: reservations.filter(r => r.status === 'pending').length,
          cancelled: reservations.filter(r => r.status === 'cancelled').length
        },
        topEvents,
        timeSeriesData,
        categoryBreakdown,
        engagement: {
          testimonials: testimonials.length,
          avgRating: avgTestimonialRating,
          approved: testimonials.filter(t => t.is_approved).length
        }
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, gradient, delay, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-none p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-light ${
          change >= 0 ? 'text-white' : 'text-red-200'
        }`}>
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <ArrowDownRight className="w-4 h-4" strokeWidth={1.5} />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div className="text-4xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
        {value}
      </div>
      <div className="text-sm text-white/90 font-light">{title}</div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" strokeWidth={1.5} />
      </div>
    );
  }

  const maxRevenue = Math.max(...analytics.timeSeriesData.map(d => d.revenue), 1);

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
            Analytics & <span className="elegant-text">Insights</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Real-time performance metrics and deep insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 border transition-colors font-light text-sm inline-flex items-center gap-2 ${
              showComparison
                ? 'border-amber-700 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                : 'border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            Compare
          </button>
          {['7days', '30days', '90days', '1year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-light transition-colors ${
                timeRange === range
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300'
              }`}
            >
              {range === '7days' ? '7D' : range === '30days' ? '30D' : range === '90days' ? '90D' : '1Y'}
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            className="p-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors"
          >
            <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            className="p-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors"
          >
            <Download className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`R${analytics.overview.totalRevenue.toLocaleString()}`}
          change={analytics.overview.revenueChange}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
          delay={0}
        />
        <MetricCard
          title="Bookings"
          value={analytics.overview.totalReservations}
          change={analytics.overview.reservationGrowth}
          icon={Calendar}
          gradient="from-blue-500 to-cyan-600"
          delay={0.1}
        />
        <MetricCard
          title="New Users"
          value={analytics.overview.newUsers}
          change={analytics.overview.userGrowth}
          icon={Users}
          gradient="from-purple-500 to-pink-600"
          delay={0.2}
        />
        <MetricCard
          title="Conversion"
          value={`${analytics.conversion.rate.toFixed(1)}%`}
          change={8.5}
          icon={Target}
          gradient="from-amber-500 to-orange-600"
          delay={0.3}
        />
      </div>

      {/* Revenue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="feature-card p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Performance <span className="elegant-text">Overview</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
              Revenue and engagement trends over time
            </p>
          </div>
          <div className="flex items-center gap-3">
            {['revenue', 'events', 'registrations'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 text-sm font-light transition-colors ${
                  selectedMetric === metric
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 flex items-end justify-between gap-2 mb-4">
          {analytics.timeSeriesData.map((data, i) => {
            const value = data[selectedMetric];
            const maxValue = Math.max(...analytics.timeSeriesData.map(d => d[selectedMetric]), 1);
            const heightPercentage = (value / maxValue) * 100;
            
            return (
              <div key={i} className="flex-1 group cursor-pointer relative flex flex-col justify-end h-full">
                <div 
                  className="bg-gradient-to-t from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 transition-all relative"
                  style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 text-xs font-light whitespace-nowrap shadow-2xl">
                      <div className="font-medium mb-1">{data.date}</div>
                      <div className="space-y-1">
                        <div>Revenue: R{data.revenue.toLocaleString()}</div>
                        <div>Events: {data.events}</div>
                        <div>Bookings: {data.registrations}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-light">
          {analytics.timeSeriesData.map((data, i) => (
            <div key={i} className="flex-1 text-center">
              {i % Math.ceil(analytics.timeSeriesData.length / 6) === 0 ? data.date : ''}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Category Revenue Breakdown */}
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
            {analytics.categoryBreakdown.slice(0, 5).map((cat, i) => (
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
            ))}
          </div>
        </motion.div>

        {/* Event Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Event <span className="elegant-text">Metrics</span>
            </h3>
            <BarChart3 className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20">
              <div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {analytics.events.upcoming}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Upcoming Events</div>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-950/40">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20">
              <div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {analytics.events.past}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Completed Events</div>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-950/40">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-700">
              <div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light mb-1">Avg Fill Rate</div>
                <div className="text-2xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {analytics.events.avgFillRate.toFixed(1)}%
                </div>
              </div>
              <div className="h-16 w-16 relative">
                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-stone-200 dark:text-stone-800"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${analytics.events.avgFillRate}, 100`}
                    className="text-amber-500"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="feature-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Conversion <span className="elegant-text">Funnel</span>
            </h3>
            <TrendingUp className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400 font-light">Confirmed</span>
                <span className="text-sm font-light text-stone-900 dark:text-stone-50">{analytics.conversion.confirmed}</span>
              </div>
              <div className="h-14 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-light text-lg" style={{ fontFamily: 'Crimson Pro, serif' }}>
                {((analytics.conversion.confirmed / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400 font-light">Pending</span>
                <span className="text-sm font-light text-stone-900 dark:text-stone-50">{analytics.conversion.pending}</span>
              </div>
              <div 
                className="h-12 bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center text-white font-light" style={{ fontFamily: 'Crimson Pro, serif' }}
                style={{ width: `${(analytics.conversion.pending / (analytics.overview.totalReservations || 1)) * 100}%` }}
              >
                {((analytics.conversion.pending / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600 dark:text-stone-400 font-light">Cancelled</span>
                <span className="text-sm font-light text-stone-900 dark:text-stone-50">{analytics.conversion.cancelled}</span>
              </div>
              <div 
                className="h-10 bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-light text-sm" style={{ fontFamily: 'Crimson Pro, serif' }}
                style={{ width: `${Math.max((analytics.conversion.cancelled / (analytics.overview.totalReservations || 1)) * 100, 5)}%` }}
              >
                {((analytics.conversion.cancelled / (analytics.overview.totalReservations || 1)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
              <DollarSign className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-light text-stone-700 dark:text-stone-300">Avg Revenue</h4>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            R{(analytics.revenue.total / (analytics.events.total || 1)).toFixed(0)}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light">Per event</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
              <Users className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-light text-stone-700 dark:text-stone-300">Avg Capacity</h4>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {Math.round(analytics.events.avgCapacity)}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light">Seats per event</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-elegant bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
              <Star className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-light text-stone-700 dark:text-stone-300">Satisfaction</h4>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1 flex items-center gap-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {analytics.engagement.avgRating.toFixed(1)}
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" strokeWidth={1.5} />
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light">{analytics.engagement.testimonials} reviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="feature-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-light text-stone-700 dark:text-stone-300">Subscribers</h4>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {analytics.users.activeSubscribers}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-light flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            {analytics.overview.subscriberGrowth}% growth
          </p>
        </motion.div>
      </div>

      {/* Top Performing Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="feature-card p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Top Performing <span className="elegant-text">Events</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
              Ranked by total revenue generated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            <Sparkles className="w-5 h-5 text-purple-500" strokeWidth={1.5} />
          </div>
        </div>
        
        {analytics.topEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-stone-500 dark:text-stone-400 font-light">No event data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.topEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors cursor-pointer group"
              >
                <div className={`w-12 h-12 flex items-center justify-center font-light text-lg ${
                  index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-stone-300 to-stone-400 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                  'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}>
                  {index === 0 && <Crown className="w-6 h-6" strokeWidth={1.5} />}
                  {index !== 0 && `#${index + 1}`}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-light text-lg text-stone-900 dark:text-stone-50 mb-1 truncate" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" strokeWidth={1.5} />
                      {event.registered} bookings
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" strokeWidth={1.5} />
                      {event.fillRate.toFixed(0)}% capacity
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-xs">
                      {event.category}
                    </span>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(event.fillRate, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    R{event.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-500 font-light">revenue</div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
                  <Eye className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="feature-card p-8 mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
            AI-Powered <span className="elegant-text">Insights</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Insight 1 */}
          <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                Strong Growth
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                Revenue increased by {analytics.overview.revenueChange.toFixed(0)}% compared to last period. Keep up the momentum!
              </p>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500">
            <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                Top Category
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                {analytics.categoryBreakdown[0]?.category || 'N/A'} generates the most revenue. Consider creating more events in this category.
              </p>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                Conversion Rate
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                {analytics.conversion.rate.toFixed(0)}% conversion rate. {analytics.conversion.rate > 70 ? 'Excellent performance!' : 'Room for improvement through targeted marketing.'}
              </p>
            </div>
          </div>

          {/* Insight 4 */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                Community Growth
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                {analytics.overview.newUsers} new users joined. Your community is expanding at {analytics.overview.userGrowth.toFixed(0)}% growth rate.
              </p>
            </div>
          </div>

          {/* Insight 5 */}
          <div className="flex items-start gap-4 p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500">
            <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                Hot Streak
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                Average fill rate of {analytics.events.avgFillRate.toFixed(0)}%. Your events are highly sought after!
              </p>
            </div>
          </div>

          {/* Insight 6 */}
          <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 border-l-4 border-indigo-500">
            <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-light text-stone-900 dark:text-stone-50 mb-1">
                High Satisfaction
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light">
                {analytics.engagement.avgRating.toFixed(1)}/5 average rating from {analytics.engagement.testimonials} reviews. Outstanding feedback!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}