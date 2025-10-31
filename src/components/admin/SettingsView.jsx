// src/components/admin/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Globe, Bell, Shield, Palette, Database, Mail,
  Zap, Code, Save, AlertCircle, CheckCircle, Eye, EyeOff,
  Upload, Download, Trash2, RefreshCw, Lock, Key, Loader2,
  DollarSign, CreditCard, Webhook, FileText, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    siteName: 'Intellectual Intimacy',
    siteDescription: 'Building meaningful connections through deep conversation',
    siteUrl: 'https://intellectualintimacy.co.ZA',
    adminEmail: 'admin@intellectualintimacy.co.ZA',
    timezone: 'Africa/Johannesburg',
    language: 'en',
    
    // Appearance
    primaryColor: '#d97706',
    accentColor: '#e11d48',
    fontFamily: 'Crimson Pro',
    darkMode: 'auto',
    
    // Notifications
    emailNotifications: true,
    newReservationAlert: true,
    newUserAlert: true,
    weeklyReport: true,
    monthlyReport: true,
    
    // Events
    defaultCapacity: 50,
    defaultDuration: 120,
    allowWaitlist: true,
    autoConfirm: false,
    cancellationDays: 7,
    
    // Payments
    currency: 'ZAR',
    taxRate: 15,
    paymentGateway: 'stripe',
    testMode: true,
    
    // Email
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@intellectualintimacy.com',
    fromName: 'Intellectual Intimacy',
    
    // Advanced
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxFileSize: 5,
    enableAnalytics: true,
    googleAnalyticsId: '',
    
    // API
    apiEnabled: true,
    webhookUrl: '',
    apiRateLimit: 100
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'events', label: 'Events', icon: Settings },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'api', label: 'API & Webhooks', icon: Code }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate save to database or configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = () => {
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSettings({ ...settings, ...imported });
        alert('Settings imported successfully!');
      } catch (err) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

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
            Settings & Configuration
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Customize your platform and manage configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-5 h-5" /> Import
            <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
          </label>
          <button
            onClick={handleExportSettings}
            className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl hover:scale-105 transition-transform inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sticky top-8">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-light">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <GeneralSettings key="general" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings key="appearance" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings key="notifications" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'events' && (
              <EventSettings key="events" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'payments' && (
              <PaymentSettings key="payments" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'email' && (
              <EmailSettings key="email" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings key="security" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings key="advanced" settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'api' && (
              <APISettings key="api" settings={settings} setSettings={setSettings} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// General Settings Component
function GeneralSettings({ settings, setSettings }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        General Settings
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Site Description</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admin Email</label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
              <option value="xh">Xhosa</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Tip:</strong> Changes to site name and URL will affect how your platform appears to users and in search engines.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Appearance Settings Component
function AppearanceSettings({ settings, setSettings }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Appearance & Branding
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-20 h-12 rounded-xl border border-stone-200 dark:border-stone-800 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-20 h-12 rounded-xl border border-stone-200 dark:border-stone-800 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="Crimson Pro">Crimson Pro (Serif)</option>
            <option value="Inter">Inter (Sans-serif)</option>
            <option value="Playfair Display">Playfair Display (Serif)</option>
            <option value="Lora">Lora (Serif)</option>
            <option value="Roboto">Roboto (Sans-serif)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Dark Mode</label>
          <div className="flex gap-3">
            {['auto', 'light', 'dark'].map(mode => (
              <button
                key={mode}
                onClick={() => setSettings({ ...settings, darkMode: mode })}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  settings.darkMode === mode
                    ? 'border-stone-900 dark:border-white bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Logo & Brand Assets</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 text-center hover:border-stone-400 dark:hover:border-stone-600 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <p className="text-sm font-medium mb-1">Upload Logo</p>
              <p className="text-xs text-stone-500">PNG, SVG (Max 2MB)</p>
            </div>
            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 text-center hover:border-stone-400 dark:hover:border-stone-600 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <p className="text-sm font-medium mb-1">Upload Favicon</p>
              <p className="text-xs text-stone-500">ICO, PNG (32x32px)</p>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Preview</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className="h-24 rounded-xl flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Primary Color
            </div>
            <div 
              className="h-24 rounded-xl flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: settings.accentColor }}
            >
              Accent Color
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Notification Settings Component
function NotificationSettings({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Notification Preferences
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
          <div>
            <div className="font-medium mb-1">Email Notifications</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">
              Master toggle for all email notifications
            </div>
          </div>
          <button
            onClick={() => toggleSetting('emailNotifications')}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              settings.emailNotifications ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
              settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">New Reservation Alerts</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Get notified when someone books an event
              </div>
            </div>
            <button
              onClick={() => toggleSetting('newReservationAlert')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.newReservationAlert ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              disabled={!settings.emailNotifications}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.newReservationAlert ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">New User Alerts</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Get notified when someone joins your community
              </div>
            </div>
            <button
              onClick={() => toggleSetting('newUserAlert')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.newUserAlert ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              disabled={!settings.emailNotifications}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.newUserAlert ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Weekly Reports</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Receive weekly analytics summary
              </div>
            </div>
            <button
              onClick={() => toggleSetting('weeklyReport')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.weeklyReport ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              disabled={!settings.emailNotifications}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.weeklyReport ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Monthly Reports</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Receive monthly performance insights
              </div>
            </div>
            <button
              onClick={() => toggleSetting('monthlyReport')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.monthlyReport ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              disabled={!settings.emailNotifications}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.monthlyReport ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Event Settings Component
function EventSettings({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Event Configuration
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Default Capacity</label>
            <input
              type="number"
              value={settings.defaultCapacity}
              onChange={(e) => setSettings({ ...settings, defaultCapacity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Duration (minutes)</label>
            <input
              type="number"
              value={settings.defaultDuration}
              onChange={(e) => setSettings({ ...settings, defaultDuration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              min="30"
              step="30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cancellation Policy (days before event)</label>
          <input
            type="number"
            value={settings.cancellationDays}
            onChange={(e) => setSettings({ ...settings, cancellationDays: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            min="0"
          />
          <p className="text-sm text-stone-500 mt-2">Users can cancel and get full refund if done this many days before the event</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Allow Waitlist</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Let users join a waitlist when events are full
              </div>
            </div>
            <button
              onClick={() => toggleSetting('allowWaitlist')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.allowWaitlist ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.allowWaitlist ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Auto-Confirm Reservations</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Automatically confirm reservations without manual approval
              </div>
            </div>
            <button
              onClick={() => toggleSetting('autoConfirm')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.autoConfirm ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.autoConfirm ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Payment Settings Component
function PaymentSettings({ settings, setSettings }) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Payment Configuration
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Gateway</label>
          <div className="grid md:grid-cols-3 gap-4">
            {['stripe', 'paypal', 'payfast'].map(gateway => (
              <button
                key={gateway}
                onClick={() => setSettings({ ...settings, paymentGateway: gateway })}
                className={`p-4 border rounded-xl transition-all ${
                  settings.paymentGateway === gateway
                    ? 'border-stone-900 dark:border-white bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium capitalize">{gateway}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-amber-900 dark:text-amber-200 mb-1">Test Mode Active</div>
            <div className="text-sm text-amber-800 dark:text-amber-300">
              All payments are in test mode. No real transactions will be processed.
            </div>
            <button
              onClick={() => setSettings({ ...settings, testMode: !settings.testMode })}
              className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              {settings.testMode ? 'Switch to Live Mode' : 'Switch to Test Mode'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Keys</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-stone-600 dark:text-stone-400 mb-2">Publishable Key</label>
              <input
                type="text"
                placeholder="pk_test_..."
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 dark:text-stone-400 mb-2">Secret Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-3 pr-12 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Payment Methods</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {['Credit Card', 'Debit Card', 'EFT', 'Mobile Money'].map(method => (
              <div key={method} className="flex items-center gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm font-medium">{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Email Settings Component
function EmailSettings({ settings, setSettings }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Email Configuration
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">From Email</label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Name</label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">SMTP Configuration</h4>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button className="w-full px-4 py-3 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl hover:border-stone-400 dark:hover:border-stone-600 transition-colors inline-flex items-center justify-center gap-2 text-stone-600 dark:text-stone-400">
              <Mail className="w-5 h-5" />
              Send Test Email
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Email Templates</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {['Welcome Email', 'Reservation Confirmation', 'Event Reminder', 'Cancellation Notice', 'Newsletter', 'Password Reset'].map(template => (
              <button
                key={template}
                className="p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium mb-1">{template}</div>
                    <div className="text-xs text-stone-500">Last edited 2 days ago</div>
                  </div>
                  <FileText className="w-5 h-5 text-stone-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Security Settings Component
function SecuritySettings({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Security & Privacy
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Allow User Registration</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Let new users create accounts
              </div>
            </div>
            <button
              onClick={() => toggleSetting('allowRegistration')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.allowRegistration ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.allowRegistration ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <div className="font-medium mb-1">Email Verification Required</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                Users must verify email before accessing platform
              </div>
            </div>
            <button
              onClick={() => toggleSetting('requireEmailVerification')}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.requireEmailVerification ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                settings.requireEmailVerification ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            min="5"
          />
          <p className="text-sm text-stone-500 mt-2">Users will be logged out after this period of inactivity</p>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-200 mb-1">2FA Enabled</div>
                <div className="text-sm text-green-800 dark:text-green-300">
                  Your admin account is protected with two-factor authentication
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Manage 2FA Settings
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Password Policy</h4>
          <div className="space-y-3">
            {[
              'Minimum 8 characters',
              'At least one uppercase letter',
              'At least one number',
              'At least one special character',
              'Password expires every 90 days'
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4 text-red-600 dark:text-red-400">Danger Zone</h4>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-flex items-center justify-center gap-2 font-medium">
              <RefreshCw className="w-5 h-5" />
              Reset All Settings
            </button>
            <button className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 font-medium">
              <Trash2 className="w-5 h-5" />
              Delete All User Data
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Advanced Settings Component
function AdvancedSettings({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Advanced Settings
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
          <div>
            <div className="font-medium mb-1 text-red-900 dark:text-red-200">Maintenance Mode</div>
            <div className="text-sm text-red-800 dark:text-red-300">
              Site will be unavailable to non-admin users
            </div>
          </div>
          <button
            onClick={() => toggleSetting('maintenanceMode')}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              settings.maintenanceMode ? 'bg-red-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
              settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Maximum File Upload Size (MB)</label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
            min="1"
            max="50"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
          <div>
            <div className="font-medium mb-1">Enable Analytics Tracking</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">
              Track user behavior and site performance
            </div>
          </div>
          <button
            onClick={() => toggleSetting('enableAnalytics')}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              settings.enableAnalytics ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
              settings.enableAnalytics ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {settings.enableAnalytics && (
          <div>
            <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
            />
          </div>
        )}

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">Database Maintenance</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <Database className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <div className="text-sm font-medium mb-1">Optimize Database</div>
              <div className="text-xs text-stone-500">Clean up and optimize tables</div>
            </button>

            <button className="p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <Download className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <div className="text-sm font-medium mb-1">Backup Database</div>
              <div className="text-xs text-stone-500">Create full database backup</div>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
          <h4 className="font-medium mb-4">System Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1">Platform Version</div>
              <div className="text-lg font-light">v2.5.0</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1">Database Size</div>
              <div className="text-lg font-light">247 MB</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1">Storage Used</div>
              <div className="text-lg font-light">1.2 GB / 10 GB</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1">Last Backup</div>
              <div className="text-lg font-light">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// API Settings Component
function APISettings({ settings, setSettings }) {
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [apiKey] = useState('ii_live_' + Math.random().toString(36).slice(2, 34));

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8"
    >
      <h3 className="text-2xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
        API & Webhooks
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl">
          <div>
            <div className="font-medium mb-1">Enable API Access</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">
              Allow external applications to access your data
            </div>
          </div>
          <button
            onClick={() => toggleSetting('apiEnabled')}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              settings.apiEnabled ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
              settings.apiEnabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {settings.apiEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Key className="w-5 h-5" />
                </button>
                <button className="px-4 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-stone-500 mt-2">Keep this key secure. It provides full access to your account.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rate Limit (requests/hour)</label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                min="10"
                max="10000"
              />
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
              <h4 className="font-medium mb-4">API Documentation</h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <Code className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-200 mb-1">API Endpoints Available</div>
                    <div className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                      Access events, reservations, users, and more via RESTful API
                    </div>
                    <div className="space-y-2 text-sm font-mono text-blue-900 dark:text-blue-200">
                      <div>GET /api/v1/events</div>
                      <div>POST /api/v1/reservations</div>
                      <div>GET /api/v1/users</div>
                      <div>POST /api/v1/testimonials</div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Full Documentation
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
              <h4 className="font-medium mb-4">Webhooks</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Webhook Events</label>
                  <div className="space-y-2">
                    {[
                      'event.created',
                      'event.updated',
                      'reservation.created',
                      'reservation.confirmed',
                      'reservation.cancelled',
                      'user.registered',
                      'testimonial.submitted'
                    ].map(event => (
                      <div key={event} className="flex items-center gap-3 p-3 border border-stone-200 dark:border-stone-800 rounded-lg">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm font-mono">{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

               <div>
                    <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                    <div className="relative">
                    <input
                        type={showWebhookSecret ? "text" : "password"}
                        // FIX APPLIED HERE: The entire expression is now inside { }
                        value={"whsec_" + Math.random().toString(36).slice(2, 26)}
                        readOnly
                        className="w-full px-4 py-3 pr-12 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-sm"
                    />
                    <button
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                    >
                        {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    </div>
                    <p className="text-sm text-stone-500 mt-2">Use this to verify webhook signatures</p>
                </div>

                <button className="w-full px-4 py-3 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl hover:border-stone-400 dark:hover:border-stone-600 transition-colors inline-flex items-center justify-center gap-2 text-stone-600 dark:text-stone-400">
                  <Webhook className="w-5 h-5" />
                  Test Webhook
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
              <h4 className="font-medium mb-4">Recent API Activity</h4>
              <div className="space-y-3">
                {[
                  { method: 'GET', endpoint: '/api/v1/events', status: 200, time: '2 minutes ago' },
                  { method: 'POST', endpoint: '/api/v1/reservations', status: 201, time: '15 minutes ago' },
                  { method: 'GET', endpoint: '/api/v1/users', status: 200, time: '1 hour ago' },
                  { method: 'PUT', endpoint: '/api/v1/events/123', status: 200, time: '2 hours ago' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        activity.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        activity.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        {activity.method}
                      </span>
                      <span className="text-sm font-mono">{activity.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 200 || activity.status === 201
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-stone-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}