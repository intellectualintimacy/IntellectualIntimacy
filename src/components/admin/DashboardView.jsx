// src/components/admin/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Users, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    totalUsers: 0,
    activeSubscribers: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [eventsRes, reservationsRes, usersRes, subscribersRes] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact' }).eq('status', 'active')
      ]);

      setStats({
        totalEvents: eventsRes.count || 0,
        totalReservations: reservationsRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeSubscribers: subscribersRes.count || 0
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
        .limit(5);

      setRecentReservations(reservations || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Events', 
      value: stats.totalEvents, 
      icon: Calendar, 
      color: 'from-blue-500 to-cyan-500', 
      change: '+12%' 
    },
    { 
      label: 'Reservations', 
      value: stats.totalReservations, 
      icon: CreditCard, 
      color: 'from-purple-500 to-pink-500', 
      change: '+23%' 
    },
    { 
      label: 'Active Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'from-amber-500 to-orange-500', 
      change: '+8%' 
    },
    { 
      label: 'Subscribers', 
      value: stats.activeSubscribers, 
      icon: Mail, 
      color: 'from-green-500 to-emerald-500', 
      change: '+15%' 
    }
  ];

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
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
          Welcome Back
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          Here's what's happening with your community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-light mb-1">{stat.value}</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Upcoming Events
            </h3>
            <Calendar className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-light">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-stone-500">
                      {event.location} • {event.start_time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {event.available_spots}/{event.capacity}
                    </div>
                    <div className="text-xs text-stone-500">spots left</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Recent Reservations
            </h3>
            <CreditCard className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {recentReservations.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No reservations yet</p>
            ) : (
              recentReservations.map(res => (
                <div 
                  key={res.id} 
                  className="flex items-center gap-4 p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {res.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{res.user_name}</div>
                    <div className="text-xs text-stone-500">{res.user_email}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    res.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : res.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {res.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}