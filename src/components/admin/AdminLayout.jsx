// src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, MessageSquare, Mail,
  Settings, ChevronLeft, ChevronRight, CreditCard, BarChart3
} from 'lucide-react';
import DashboardView from './DashboardView';
import EventsManagement from './EventsManagement';
import ReservationsManagement from './ReservationsManagement';
import UsersManagement from './UsersManagement';
import TestimonialsManagement from './TestimonialsManagement';
import NewsletterManagement from './NewsletterManagement';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';



export default function AdminLayout({ currentView, setCurrentView }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'reservations', icon: CreditCard, label: 'Reservations' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'testimonials', icon: MessageSquare, label: 'Testimonials' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col fixed h-screen z-30"
      >
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 relative">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">Dashboard</span>
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-6 right-4 p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'bg-stone-900 dark:bg-stone-800 text-white'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-light">{item.label}</span>}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-auto"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && <DashboardView key="dashboard" />}
          {currentView === 'events' && <EventsManagement key="events" />}
          {currentView === 'reservations' && <ReservationsManagement key="reservations" />}
          {currentView === 'users' && <UsersManagement key="users" />}
          {currentView === 'testimonials' && <TestimonialsManagement key="testimonials" />}
          {currentView === 'newsletter' && <NewsletterManagement key="newsletter" />}
          {currentView === 'analytics' && <AnalyticsView key="analytics" />}
          {currentView === 'settings' && <SettingsView key="settings" />}
        </AnimatePresence>
      </main>
    </div>
  );
}