// src/hooks/useAdmin.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!error && profile?.is_admin) setIsAdmin(true);
      } catch (err) {
        console.error("useAdmin error", err);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  return { isAdmin, checking };
}
