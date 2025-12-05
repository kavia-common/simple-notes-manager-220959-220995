import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getSupabase } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useNotes - Manage notes list with CRUD and realtime updates.
 *
 * Table schema expected:
 * - id: uuid (primary key, default uuid_generate_v4() or gen_random_uuid())
 * - user_id: uuid (references auth.users)
 * - title: text
 * - content: text
 * - created_at: timestamp with time zone default now()
 * - updated_at: timestamp with time zone default now()
 */
export function useNotes(userId) {
  const supabase = useMemo(() => getSupabase(), []);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const enrich = useCallback((n) => {
    return {
      ...n,
      meta: {
        updatedDistance: n.updated_at
          ? formatDistanceToNow(new Date(n.updated_at), { addSuffix: true })
          : 'just now',
      },
    };
  }, []);

  const load = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('load notes error', error);
    }
    setNotes((data || []).map(enrich));
    setLoading(false);
  }, [supabase, userId, enrich]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    // Subscribe to Postgres changes on notes for this user
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotes((prev) => {
            const next = [...prev];
            if (payload.eventType === 'INSERT') {
              const n = enrich(payload.new);
              return [n, ...next.filter((p) => p.id !== n.id)];
            }
            if (payload.eventType === 'UPDATE') {
              const n = enrich(payload.new);
              return [n, ...next.filter((p) => p.id !== n.id)];
            }
            if (payload.eventType === 'DELETE') {
              return next.filter((p) => p.id !== payload.old.id);
            }
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, enrich]);

  const createNote = useCallback(
    async (title = 'Untitled', content = '') => {
      if (!userId) return { error: new Error('No user') };
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, content, user_id: userId }])
        .select()
        .single();
      if (error) return { error };
      return { data: enrich(data) };
    },
    [supabase, userId, enrich]
  );

  const updateNote = useCallback(
    async (id, updates) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return { error };
      return { data: enrich(data) };
    },
    [supabase, enrich]
  );

  const deleteNote = useCallback(
    async (id) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      return { error };
    },
    [supabase]
  );

  return { notes, loading, reload: load, createNote, updateNote, deleteNote };
}

export default useNotes;
