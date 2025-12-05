import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';

/**
 * PUBLIC_INTERFACE
 * NoteEditor - Editor for a single note with title and content.
 */
export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notes, updateNote, deleteNote } = useNotes(user?.id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const note = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);

  const onSave = async () => {
    if (!noteId) return;
    await updateNote(noteId, { title, content });
  };

  const onDelete = async () => {
    if (!noteId) return;
    await deleteNote(noteId);
    navigate('/notes');
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
          <Link to="/notes" className="btn ghost">Back</Link>
          <button className="btn" onClick={onSave}>Save</button>
          <button className="btn danger" onClick={onDelete}>Delete</button>
          <button className="btn ghost" onClick={signOut}>Sign out</button>
          <div className="avatar" title={user?.email}>{initials}</div>
        </div>
      </header>

      <main className="content">
        <div className="card editor">
          <input
            className="input"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="Start typing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div>
            <button className="btn" onClick={onSave}>Save changes</button>
          </div>
        </div>
      </main>
    </div>
  );
}
