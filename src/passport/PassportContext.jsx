// PassportContext — provides auth state and user profile to all passport pages.
// Wrap passport routes with <PassportProvider> to access usePassport() hook.

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PassportContext = createContext(null);

export function PassportProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  // Load the current Supabase session on mount and listen for changes.
  // Skip entirely if Supabase isn't configured yet (no env vars).
  useEffect(() => {
    if (!supabase) {
      setSession(null); // not loading — just unconfigured
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load the user's passport_members row (name, visit count, member ID, etc.)
  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('passport_members')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data || null);
  };

  // Call after signup or profile update to refresh local state.
  const refreshProfile = () => {
    if (session) fetchProfile(session.user.id);
  };

  // Sign up a new passport member.
  // Creates the Supabase auth user and the passport_members profile row.
  const signUp = async ({ firstName, email, phone, password }) => {
    if (!supabase) throw new Error('Supabase is not configured.');

    // Generate member ID here so it's consistent in the trigger.
    const memberId = `ISB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Pass profile fields as auth metadata — the database trigger
    // (handle_new_passport_user) picks these up and creates the
    // passport_members row server-side, bypassing RLS entirely.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          phone: phone || null,
          member_id: memberId,
        },
      },
    });
    if (error) throw error;

    return data;
  };

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = () => supabase?.auth.signOut();

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading: session === undefined,
    isStaff: profile?.is_staff === true,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport() {
  const ctx = useContext(PassportContext);
  if (!ctx) throw new Error('usePassport must be used inside <PassportProvider>');
  return ctx;
}
