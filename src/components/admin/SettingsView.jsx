import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Globe, Bell, Shield, Palette, Database, Mail,
  Zap, Code, Save, AlertCircle, CheckCircle, Eye, EyeOff,
  Upload, Download, Trash2, RefreshCw, Lock, Key, Loader2,
  DollarSign, CreditCard, Webhook, FileText, Image as ImageIcon,
  Copy, Check, X, Search, Filter as FilterIcon, Terminal, Calendar,
  Activity, BarChart3, Clock, Users, TrendingUp
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [changes, setChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: 'Intellectual Intimacy',
    siteDescription: 'Building meaningful connections through deep conversation',
    siteUrl: 'https://intellectualintimacy.co.za',
    adminEmail: 'admin@intellectualintimacy.co.za',
    timezone: 'Africa/Johannesburg',
    language: 'en',
    primaryColor: '#d97706',
    accentColor: '#e11d48',
    fontFamily: 'Crimson Pro',
    darkMode: 'auto',
    emailNotifications: true,
    newReservationAlert: true,
    newUserAlert: true,
    weeklyReport: true,
    monthlyReport: true,
    defaultCapacity: 50,
    defaultDuration: 120,
    allowWaitlist: true,
    autoConfirm: false,
    cancellationDays: 7,
    currency: 'ZAR',
    taxRate: 15,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxFileSize: 5,
    enableAnalytics: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(Object.keys(changes).length > 0);
  }, [changes]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load settings from Supabase or localStorage
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (or Supabase in production)
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChanges({});
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
    window.URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSettings({ ...settings, ...imported });
        setChanges(imported);
        alert('Settings imported successfully!');
      } catch (err) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  const handleDiscardChanges = () => {
    if (!window.confirm('Discard all unsaved changes?')) return;
    loadSettings();
    setChanges({});
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe, count: null },
    { id: 'appearance', label: 'Appearance', icon: Palette, count: null },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: Object.values(settings).filter(v => typeof v === 'boolean' && v && settings.emailNotifications).length },
    { id: 'events', label: 'Events', icon: Calendar, count: null },
    { id: 'security', label: 'Security', icon: Shield, count: null },
    { id: 'advanced', label: 'Advanced', icon: Zap, count: null },
    { id: 'integrations', label: 'Integrations', icon: Code, count: null }
  ];

  const filteredTabs = tabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Settings & <span className="elegant-text">Configuration</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Customize your platform and manage configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-light text-sm">
              <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
              {Object.keys(changes).length} unsaved changes
            </div>
          )}
          <label className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 cursor-pointer inline-flex items-center gap-2 font-light transition-colors">
            <Upload className="w-5 h-5" strokeWidth={1.5} /> Import
            <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
          </label>
          <button
            onClick={handleExportSettings}
            className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 inline-flex items-center gap-2 font-light transition-colors"
          >
            <Download className="w-5 h-5" strokeWidth={1.5} /> Export
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center gap-2 font-light transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} /> Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-light"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
            ) : saveSuccess ? (
              <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Save className="w-5 h-5" strokeWidth={1.5} />
            )}
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-72 flex-shrink-0">
          <div className="feature-card p-4 sticky top-8">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light text-sm bg-white dark:bg-stone-950"
              />
            </div>

            <nav className="space-y-1">
              {filteredTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-all text-left font-light ${
                    activeTab === tab.id
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" strokeWidth={1.5} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700 space-y-3">
              <div className="text-xs font-light text-stone-600 dark:text-stone-400 mb-3">SYSTEM STATUS</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400 font-light">Storage</span>
                <span className="font-light text-stone-900 dark:text-stone-50">1.2GB / 10GB</span>
              </div>
              <div className="h-1 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '12%' }} />
              </div>
              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-stone-600 dark:text-stone-400 font-light">API Calls</span>
                <span className="font-light text-stone-900 dark:text-stone-50">847 / 10K</span>
              </div>
              <div className="h-1 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '8.47%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <GeneralSettings 
                key="general" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings 
                key="appearance" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings 
                key="notifications" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'events' && (
              <EventSettings 
                key="events" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'security' && (
              <SecuritySettings 
                key="security" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings 
                key="advanced" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
            {activeTab === 'integrations' && (
              <IntegrationsSettings 
                key="integrations" 
                settings={settings} 
                onChange={handleSettingChange}
                changes={changes}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// General Settings Component
function GeneralSettings({ settings, onChange, changes }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        General <span className="elegant-text">Settings</span>
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Site Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => onChange('siteName', e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
          {changes.siteName && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-light">Unsaved change</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Site Description
          </label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => onChange('siteDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Site URL
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => onChange('siteUrl', e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Admin Email
            </label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => onChange('adminEmail', e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => onChange('timezone', e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            >
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => onChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
              <option value="xh">Xhosa</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-sm text-blue-900 dark:text-blue-200 font-light">
              <strong className="font-medium">Tip:</strong> Changes to site name and URL will affect how your platform appears to users and in search engines.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Appearance Settings Component
function AppearanceSettings({ settings, onChange, changes }) {
  const [copied, setCopied] = useState('');

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Appearance & <span className="elegant-text">Branding</span>
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onChange('primaryColor', e.target.value)}
                className="w-20 h-12 border border-stone-200 dark:border-stone-700 cursor-pointer"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => onChange('primaryColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-mono text-sm"
                />
                <button
                  onClick={() => copyColor(settings.primaryColor)}
                  className="px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {copied === settings.primaryColor ? 
                    <Check className="w-4 h-4 text-green-500" strokeWidth={1.5} /> : 
                    <Copy className="w-4 h-4" strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Accent Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => onChange('accentColor', e.target.value)}
                className="w-20 h-12 border border-stone-200 dark:border-stone-700 cursor-pointer"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => onChange('accentColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-mono text-sm"
                />
                <button
                  onClick={() => copyColor(settings.accentColor)}
                  className="px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {copied === settings.accentColor ? 
                    <Check className="w-4 h-4 text-green-500" strokeWidth={1.5} /> : 
                    <Copy className="w-4 h-4" strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Font Family
          </label>
          <select
            value={settings.fontFamily}
            onChange={(e) => onChange('fontFamily', e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          >
            <option value="Crimson Pro">Crimson Pro (Serif)</option>
            <option value="Inter">Inter (Sans-serif)</option>
            <option value="Playfair Display">Playfair Display (Serif)</option>
            <option value="Lora">Lora (Serif)</option>
            <option value="Roboto">Roboto (Sans-serif)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Dark Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['auto', 'light', 'dark'].map(mode => (
              <button
                key={mode}
                onClick={() => onChange('darkMode', mode)}
                className={`px-4 py-3 border transition-all font-light ${
                  settings.darkMode === mode
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Color Preview */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light mb-4 text-stone-700 dark:text-stone-300">Live Preview</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className="h-24 flex items-center justify-center text-white font-light"
              style={{ backgroundColor: settings.primaryColor, fontFamily: settings.fontFamily }}
            >
              Primary Color
            </div>
            <div 
              className="h-24 flex items-center justify-center text-white font-light"
              style={{ backgroundColor: settings.accentColor, fontFamily: settings.fontFamily }}
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
function NotificationSettings({ settings, onChange, changes }) {
  const ToggleSwitch = ({ value, onChange: onToggle, disabled = false }) => (
    <button
      onClick={() => !disabled && onToggle(!value)}
      disabled={disabled}
      className={`w-14 h-8 rounded-full transition-colors relative ${
        value ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Notification <span className="elegant-text">Preferences</span>
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-950">
          <div>
            <div className="font-light text-lg text-stone-900 dark:text-stone-50 mb-1">Email Notifications</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
              Master toggle for all email notifications
            </div>
          </div>
          <ToggleSwitch
            value={settings.emailNotifications}
            onChange={(val) => onChange('emailNotifications', val)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">New Reservation Alerts</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Get notified when someone books an event
              </div>
            </div>
            <ToggleSwitch
              value={settings.newReservationAlert}
              onChange={(val) => onChange('newReservationAlert', val)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">New User Alerts</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Get notified when someone joins your community
              </div>
            </div>
            <ToggleSwitch
              value={settings.newUserAlert}
              onChange={(val) => onChange('newUserAlert', val)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Weekly Reports</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Receive weekly analytics summary every Monday
              </div>
            </div>
            <ToggleSwitch
              value={settings.weeklyReport}
              onChange={(val) => onChange('weeklyReport', val)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Monthly Reports</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Receive monthly performance insights
              </div>
            </div>
            <ToggleSwitch
              value={settings.monthlyReport}
              onChange={(val) => onChange('monthlyReport', val)}
              disabled={!settings.emailNotifications}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-light text-stone-700 dark:text-stone-300">Enabled Notifications</h4>
            <span className="text-sm font-light text-stone-900 dark:text-stone-50">
              {[settings.newReservationAlert, settings.newUserAlert, settings.weeklyReport, settings.monthlyReport].filter(Boolean).length} of 4
            </span>
          </div>
          <div className="h-2 bg-stone-200 dark:bg-stone-800 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${([settings.newReservationAlert, settings.newUserAlert, settings.weeklyReport, settings.monthlyReport].filter(Boolean).length / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Event Settings Component
function EventSettings({ settings, onChange, changes }) {
  const ToggleSwitch = ({ value, onChange: onToggle }) => (
    <button
      onClick={() => onToggle(!value)}
      className={`w-14 h-8 rounded-full transition-colors relative ${
        value ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
      }`}
    >
      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Event <span className="elegant-text">Configuration</span>
      </h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Default Capacity
            </label>
            <input
              type="number"
              value={settings.defaultCapacity}
              onChange={(e) => onChange('defaultCapacity', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.defaultDuration}
              onChange={(e) => onChange('defaultDuration', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
              min="30"
              step="30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Cancellation Policy (days before event)
          </label>
          <input
            type="number"
            value={settings.cancellationDays}
            onChange={(e) => onChange('cancellationDays', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            min="0"
          />
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-2 font-light">Users can cancel and get full refund if done this many days before the event</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Allow Waitlist</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Let users join a waitlist when events are full
              </div>
            </div>
            <ToggleSwitch
              value={settings.allowWaitlist}
              onChange={(val) => onChange('allowWaitlist', val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Auto-Confirm Reservations</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Automatically confirm reservations without manual approval
              </div>
            </div>
            <ToggleSwitch
              value={settings.autoConfirm}
              onChange={(val) => onChange('autoConfirm', val)}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-4">Quick Preview</h4>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
            <div className="text-sm text-blue-900 dark:text-blue-200 font-light space-y-2">
              <p>New events will have <strong className="font-medium">{settings.defaultCapacity} seats</strong> and last <strong className="font-medium">{settings.defaultDuration} minutes</strong></p>
              <p>Cancellations allowed up to <strong className="font-medium">{settings.cancellationDays} days</strong> before event</p>
              <p>Waitlist: <strong className="font-medium">{settings.allowWaitlist ? 'Enabled' : 'Disabled'}</strong> • Auto-confirm: <strong className="font-medium">{settings.autoConfirm ? 'Yes' : 'No'}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Security Settings Component
function SecuritySettings({ settings, onChange, changes }) {
  const ToggleSwitch = ({ value, onChange: onToggle }) => (
    <button
      onClick={() => onToggle(!value)}
      className={`w-14 h-8 rounded-full transition-colors relative ${
        value ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
      }`}
    >
      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Security & <span className="elegant-text">Privacy</span>
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Allow User Registration</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Let new users create accounts
              </div>
            </div>
            <ToggleSwitch
              value={settings.allowRegistration}
              onChange={(val) => onChange('allowRegistration', val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
            <div>
              <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Email Verification Required</div>
              <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
                Users must verify email before accessing platform
              </div>
            </div>
            <ToggleSwitch
              value={settings.requireEmailVerification}
              onChange={(val) => onChange('requireEmailVerification', val)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            min="5"
          />
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-2 font-light">Users will be logged out after this period of inactivity</p>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-4">Password Policy</h4>
          <div className="space-y-3">
            {[
              'Minimum 8 characters',
              'At least one uppercase letter',
              'At least one number',
              'At least one special character',
              'Password expires every 90 days'
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                <span className="text-sm font-light text-stone-700 dark:text-stone-300">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-red-600 dark:text-red-400 mb-4">Danger Zone</h4>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center justify-center gap-2 font-light">
              <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Advanced Settings Component
function AdvancedSettings({ settings, onChange, changes }) {
  const ToggleSwitch = ({ value, onChange: onToggle }) => (
    <button
      onClick={() => onToggle(!value)}
      className={`w-14 h-8 rounded-full transition-colors relative ${
        value ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'
      }`}
    >
      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        Advanced <span className="elegant-text">Settings</span>
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800">
          <div>
            <div className="font-light text-lg text-red-900 dark:text-red-200 mb-1">Maintenance Mode</div>
            <div className="text-sm text-red-800 dark:text-red-300 font-light">
              Site will be unavailable to non-admin users
            </div>
          </div>
          <ToggleSwitch
            value={settings.maintenanceMode}
            onChange={(val) => onChange('maintenanceMode', val)}
          />
        </div>

        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            Maximum File Upload Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => onChange('maxFileSize', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-white dark:bg-stone-950 focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
            min="1"
            max="50"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700">
          <div>
            <div className="font-light text-stone-900 dark:text-stone-50 mb-1">Enable Analytics Tracking</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 font-light">
              Track user behavior and site performance
            </div>
          </div>
          <ToggleSwitch
            value={settings.enableAnalytics}
            onChange={(val) => onChange('enableAnalytics', val)}
          />
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-4">System Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-950">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1 font-light">Platform Version</div>
              <div className="text-lg font-light text-stone-900 dark:text-stone-50">v2.5.0</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1 font-light">Database Size</div>
              <div className="text-lg font-light text-stone-900 dark:text-stone-50">247 MB</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1 font-light">Storage Used</div>
              <div className="text-lg font-light text-stone-900 dark:text-stone-50">1.2 GB / 10 GB</div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-950">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-1 font-light">Last Backup</div>
              <div className="text-lg font-light text-stone-900 dark:text-stone-50">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Integrations Settings Component
function IntegrationsSettings({ settings, onChange, changes }) {
  const [apiKey] = useState('ii_live_' + Math.random().toString(36).slice(2, 34));
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="feature-card p-8"
    >
      <h3 className="text-2xl font-light mb-6 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
        API & <span className="elegant-text">Integrations</span>
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-light mb-3 text-stone-700 dark:text-stone-300">
            API Key
          </label>
          <div className="flex gap-3">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              readOnly
              className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-none bg-stone-50 dark:bg-stone-950 font-mono text-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-4 py-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              {showKey ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <button
              onClick={copyApiKey}
              className="px-4 py-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" strokeWidth={1.5} /> : <Copy className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <button className="px-4 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-2 font-light">Keep this key secure. It provides full access to your account.</p>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-4">API Documentation</h4>
          <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
            <div className="flex items-start gap-3 mb-4">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <div className="font-light text-blue-900 dark:text-blue-200 mb-2">API Endpoints Available</div>
                <div className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-light">
                  Access events, reservations, users, and more via RESTful API
                </div>
                <div className="space-y-2 text-sm font-mono text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs">GET</span>
                    <span>/api/v1/events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs">POST</span>
                    <span>/api/v1/reservations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs">GET</span>
                    <span>/api/v1/users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">PUT</span>
                    <span>/api/v1/testimonials</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-4">Recent API Activity</h4>
          <div className="space-y-3">
            {[
              { method: 'GET', endpoint: '/api/v1/events', status: 200, time: '2 minutes ago' },
              { method: 'POST', endpoint: '/api/v1/reservations', status: 201, time: '15 minutes ago' },
              { method: 'GET', endpoint: '/api/v1/users', status: 200, time: '1 hour ago' },
              { method: 'PUT', endpoint: '/api/v1/events/123', status: 200, time: '2 hours ago' }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-light ${
                    activity.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                    activity.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {activity.method}
                  </span>
                  <span className="text-sm font-mono font-light text-stone-900 dark:text-stone-50">{activity.endpoint}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-light ${
                    activity.status === 200 || activity.status === 201
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {activity.status}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-500 font-light">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}