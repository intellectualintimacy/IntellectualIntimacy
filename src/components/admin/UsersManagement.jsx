// src/components/admin/UsersManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, MapPin, Mail, Loader2, Shield } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function UsersManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
      setUsers(data || []);
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

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

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
          Users Management
        </h2>
        <p className="text-stone-600 dark:text-stone-400">Manage community members and permissions</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="contributor">Contributor</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          No users found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <motion.div
              key={user.id}
              layout
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 truncate">{user.full_name || 'Anonymous'}</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 truncate">{user.email}</p>
                </div>
                <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                {user.location && (
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <select
                    value={user.role || 'member'}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                      user.role === 'editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      user.role === 'contributor' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    <option value="member">Member</option>
                    <option value="contributor">Contributor</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  {user.is_admin && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium inline-flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Super Admin
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                {user.bio || 'No bio available'}
              </p>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleAdminToggle(user.id, user.is_admin)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    user.is_admin
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-200'
                  }`}
                >
                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
                <a
                  href={`mailto:${user.email}`}
                  className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}