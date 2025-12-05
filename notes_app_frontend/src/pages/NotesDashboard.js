import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';

/**
 * PUBLIC_INTERFACE
 * NotesDashboard - Main notes overview page with list and quick actions.
 */
export default function NotesDashboard() {
  const { user, signOut } = useAuth();
  const { notes, loading, createNote } = useNotes(user?.id);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
    );
  }, [notes, query]);

  const onCreate = async () => {
    const { data, error } = await createNote('Untitled', '');
    if (error) return;
    // navigate to editor
    window.location.href = `/notes/${data.id}`;
  };

  const initials = (user?.email || 'U?').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <header className="appbar">
        <div className="brand">
          <div className="brand-badge">N</div>
          Simple Notes
        </div>
        <div className="grow" />
        <div className="appbar-actions">
          <button className="btn secondary" onClick={onCreate}>New note</button>
          <button className="btn ghost" onClick={signOut}>Sign out</button>
          <div className="avatar" title={user?.email}>{initials}</div>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div className="side-title">Navigation</div>
          <nav className="side-nav">
            <Link className="side-link" to="/notes">All notes</Link>
            <Link className="side-link" to="/notes/new" onClick={(e)=>{e.preventDefault(); onCreate();}}>Create note</Link>
          </nav>
          <div className="side-title">Account</div>
          <nav className="side-nav">
            <button className={clsx('side-link')} onClick={signOut} style={{ textAlign: 'left' }}>
              Sign out
            </button>
          </nav>
        </aside>

        <main className="content">
          <div className="card">
            <div className="toolbar">
              <div className="search" aria-label="Search notes">
                <span role="img" aria-label="search">🔎</span>
                <input
                  type="search"
                  placeholder="Search notes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button className="btn" onClick={onCreate}>New</button>
            </div>

            {loading ? (
              <div className="empty">Loading notes…</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                No notes yet. Create your first note!
                <div style={{ marginTop: 12 }}>
                  <button className="btn" onClick={onCreate}>Create note</button>
                </div>
              </div>
            ) : (
              <div className="note-grid" role="list">
                {filtered.map((n) => (
                  <Link key={n.id} className="note-card" to={`/notes/${n.id}`} role="listitem">
                    <h3 className="note-title">{n.title || 'Untitled'}</h3>
                    <div className="note-meta">Updated {n.meta.updatedDistance}</div>
                    <div className="badge">Open editor →</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
