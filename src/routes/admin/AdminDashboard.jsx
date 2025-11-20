import SEO from '../components/common/SEO'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setIsAdmin(profile?.is_admin || false);
    } catch (err) {
      console.error('Admin check failed:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-stone-400" />
          <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Access Denied
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            You need administrator privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    <SEO 
      title="Intellectual Intimacy - Deep Conversations, Meaningful Connections"
      description="Join us for profound dialogues that foster genuine human connections through thoughtful conversation, philosophy, and shared inquiry. Build meaningful relationships through intellectual discourse."
      keywords="intellectual intimacy, deep conversations, meaningful connections, philosophy discussions, human connection, dialogue community, thoughtful discussions, salon conversations, intellectual community"
      url="https://intellectualintimacy.co.za"
      image="https://intellectualintimacy.co.za/images/admin-og.jpg"
    />
    <AdminLayout 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
    />
    </>
  );
}