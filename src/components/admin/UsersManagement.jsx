import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MoreVertical, MapPin, Mail, Loader2, Shield, 
  Download, Filter, UserPlus, Trash2, Lock, Unlock,
  Calendar, Activity, TrendingUp, Users, Eye, Edit2,
  X, CheckCircle, XCircle, AlertCircle, Crown, Star,
  MessageSquare, Phone, Globe, Award, Target, Zap,
  BarChart3, Clock, ArrowUpRight, RefreshCw, Settings
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function UsersManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    newThisMonth: 0,
    growth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const userData = data || [];
      setUsers(userData);

      // Calculate stats
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const newThisMonth = userData.filter(u => new Date(u.created_at) >= monthAgo).length;
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      const newLastMonth = userData.filter(u => {
        const created = new Date(u.created_at);
        return created >= twoMonthsAgo && created < monthAgo;
      }).length;
      const growth = newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth * 100) : 0;

      setUserStats({
        total: userData.length,
        admins: userData.filter(u => u.is_admin).length,
        active: userData.filter(u => u.is_active !== false).length,
        newThisMonth,
        growth
      });
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role');
    }
  };

  const handleAdminToggle = async (userId, currentAdminStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentAdminStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !currentAdminStatus } : u
      ));
    } catch (err) {
      console.error('Error updating admin status:', err);
      alert('Failed to update admin status');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update user status');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} users? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', selectedUsers);

      if (error) throw error;

      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error deleting users:', err);
      alert('Failed to delete users');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Location', 'Status', 'Joined'].join(','),
      ...filteredUsers.map(u => [
        u.full_name || '',
        u.email || '',
        u.role || 'member',
        u.location || '',
        u.is_active !== false ? 'Active' : 'Inactive',
        new Date(u.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => {
      const matchesSearch = 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && u.is_active !== false) ||
        (statusFilter === 'inactive' && u.is_active === false);
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    switch(sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'name':
        filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'role':
        filtered.sort((a, b) => (a.role || 'member').localeCompare(b.role || 'member'));
        break;
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  const UserCard = ({ user }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="feature-card p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-light text-xl flex-shrink-0">
            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {user.is_admin && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-stone-900 ${
            user.is_active !== false ? 'bg-green-500' : 'bg-stone-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-light text-lg text-stone-900 dark:text-stone-50 mb-1 truncate" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {user.full_name || 'Anonymous'}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 truncate font-light">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUsers.includes(user.id)}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedUsers(prev => 
                prev.includes(user.id)
                  ? prev.filter(id => id !== user.id)
                  : [...prev, user.id]
              );
            }}
            className="w-4 h-4"
          />
          <button 
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {user.location && (
          <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-light">
            <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={user.role || 'member'}
            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`px-3 py-1 text-xs font-light border-0 cursor-pointer transition-colors ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
              user.role === 'editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
              user.role === 'contributor' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
              'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            <option value="member">Member</option>
            <option value="contributor">Contributor</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          
          {user.is_admin && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-light inline-flex items-center gap-1">
              <Shield className="w-3 h-3" strokeWidth={1.5} /> Super Admin
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 font-light">
        {user.bio || 'No bio available'}
      </p>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleAdminToggle(user.id, user.is_admin);
          }}
          className={`flex-1 px-4 py-2 transition-colors text-sm font-light inline-flex items-center justify-center gap-2 ${
            user.is_admin
              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/50'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/50'
          }`}
        >
          {user.is_admin ? <XCircle className="w-4 h-4" strokeWidth={1.5} /> : <CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
        </button>
        <a
          href={`mailto:${user.email}`}
          className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center justify-center"
        >
          <Mail className="w-4 h-4" strokeWidth={1.5} />
        </a>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="text-xs text-stone-500 dark:text-stone-500 font-light">
          Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(user.id, user.is_active !== false);
          }}
          className={`text-xs font-light inline-flex items-center gap-1 ${
            user.is_active !== false 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {user.is_active !== false ? <Unlock className="w-3 h-3" strokeWidth={1.5} /> : <Lock className="w-3 h-3" strokeWidth={1.5} />}
          {user.is_active !== false ? 'Active' : 'Inactive'}
        </button>
      </div>
    </motion.div>
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
            Users <span className="elegant-text">Management</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Manage community members and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center gap-2 font-light"
          >
            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
            Analytics
          </button>
          <button
            onClick={loadUsers}
            className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center gap-2 font-light"
          >
            <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Analytics */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                    <Users className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-light ${
                    userStats.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                    {Math.abs(userStats.growth).toFixed(0)}%
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {userStats.total}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Users</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
                    <Shield className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {userStats.admins}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Administrators</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                    <Activity className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {userStats.active}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Active Users</div>
              </div>

              <div className="feature-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-elegant bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                    <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {userStats.newThisMonth}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-light">New This Month</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="feature-card p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.5} />
              <span className="font-light text-stone-900 dark:text-stone-50">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-light text-sm inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light text-sm"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search users by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="contributor">Contributor</option>
          <option value="member">Member</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="role">By Role</option>
        </select>
        <button
          onClick={handleExport}
          className="px-4 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="feature-card p-12 text-center">
          <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-500 dark:text-stone-400 font-light">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your filters'
              : 'No users yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredUsers.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    User <span className="elegant-text">Details</span>
                  </h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="elegant-divider mb-8"></div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-light text-3xl flex-shrink-0">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-light text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {selectedUser.full_name || 'Anonymous'}
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 font-light mb-3">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 text-xs font-light ${
                        selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                        selectedUser.role === 'editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                        selectedUser.role === 'contributor' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                      }`}>
                        {selectedUser.role || 'member'}
                      </span>
                      {selectedUser.is_admin && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-light inline-flex items-center gap-1">
                          <Crown className="w-3 h-3" strokeWidth={1.5} /> Super Admin
                        </span>
                      )}
                      <span className={`px-3 py-1 text-xs font-light ${
                        selectedUser.is_active !== false 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {selectedUser.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-3">Bio</h5>
                    <p className="text-stone-600 dark:text-stone-400 font-light">
                      {selectedUser.bio || 'No bio available'}
                    </p>
                  </div>

                  {selectedUser.location && (
                    <div>
                      <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-3">Location</h5>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-light">
                        <MapPin className="w-4 h-4" strokeWidth={1.5} />
                        {selectedUser.location}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-2">Joined</h5>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-light">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        {new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-light text-stone-700 dark:text-stone-300 mb-2">Last Updated</h5>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-light">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                        {selectedUser.updated_at 
                          ? new Date(selectedUser.updated_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="elegant-divider mb-6"></div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleAdminToggle(selectedUser.id, selectedUser.is_admin);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 px-6 py-3 transition-colors font-light inline-flex items-center justify-center gap-2 ${
                      selectedUser.is_admin
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/50'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/50'
                    }`}
                  >
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    {selectedUser.is_admin ? 'Remove Admin' : 'Grant Admin'}
                  </button>
                  <button
                    onClick={() => {
                      handleStatusToggle(selectedUser.id, selectedUser.is_active !== false);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 px-6 py-3 transition-colors font-light inline-flex items-center justify-center gap-2 ${
                      selectedUser.is_active !== false
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/50'
                        : 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-950/50'
                    }`}
                  >
                    {selectedUser.is_active !== false ? <Lock className="w-4 h-4" strokeWidth={1.5} /> : <Unlock className="w-4 h-4" strokeWidth={1.5} />}
                    {selectedUser.is_active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <a
                    href={`mailto:${selectedUser.email}`}
                    className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    Email
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}