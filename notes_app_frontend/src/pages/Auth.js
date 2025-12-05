import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * PUBLIC_INTERFACE
 * Auth - Sign in page supporting email magic link for Supabase.
 */
export default function Auth() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus({ loading: true, message: 'Sending magic link...' });
    const { error: e1 } = await signInWithEmail(email);
    if (e1) {
      setError(e1.message);
      setStatus({ loading: false, message: '' });
      return;
    }
    setStatus({
      loading: false,
      message:
        'Check your email for the sign-in link. After signing in, you will be redirected.',
    });
  };

  return (
    <div className="app-shell">
      <header className="appbar">
        <div className="brand">
          <div className="brand-badge">N</div>
          Simple Notes
        </div>
        <div className="grow" />
      </header>
      <main className="content">
        <div className="card auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="helper">Sign in with a magic link sent to your email.</p>
          <form onSubmit={onSubmit} className="editor" style={{ marginTop: 12 }}>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" type="submit" disabled={status.loading}>
              {status.loading ? 'Sending...' : 'Send magic link'}
            </button>
            {status.message && (
              <div className="badge" aria-live="polite">{status.message}</div>
            )}
            {error && (
              <div className="badge" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                {error}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
