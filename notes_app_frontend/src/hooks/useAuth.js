import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useAuth - React hook for Supabase auth session state and helpers.
 */
export function useAuth() {
  const supabase = useMemo(() => getSupabase(), []);
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = async (email) => {
    // Uses magic link flow; emailRedirectTo should be configured in Supabase project settings
    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.REACT_APP_FRONTEND_URL ||
          window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user: session?.user ?? null, initializing, signInWithEmail, signOut };
}

export default useAuth;
