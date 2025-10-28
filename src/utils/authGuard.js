import { supabase } from '../lib/supabase';

export const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

export const requireAuth = async (navigate) => {
  const user = await checkAuth();
  if (!user) {
    navigate('/login');
    return false;
  }
  return true;
};