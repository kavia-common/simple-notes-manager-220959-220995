import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import NotesDashboard from './pages/NotesDashboard';
import NoteEditor from './pages/NoteEditor';

/**
 * PUBLIC_INTERFACE
 * App - Root component with routing and protected routes.
 */
function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  if (initializing) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

/**
 * PUBLIC_INTERFACE
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:noteId"
          element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
