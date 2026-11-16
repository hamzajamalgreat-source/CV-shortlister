import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { signOut } from '../../lib/supabase';
import { Moon, Sun, UploadCloud } from 'lucide-react';

interface Props { children: React.ReactNode; maxWidth?: 'sm' | 'md' | 'lg' | 'xl'; }

function useDarkMode() {
  const [dark, setDark] = useState(true); // Default to dark
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'var(--color-bg-primary)';
  }, []);
  return [dark, setDark] as const;
}

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <header
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
        className="sticky top-0 z-50 backdrop-blur-md bg-opacity-90"
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'var(--gradient-primary)' }}
            >
              CV
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              CV Screening
            </span>
          </Link>

          {/* Middle Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/upload"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Upload
            </Link>
            <Link
              to="/history"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              History
            </Link>
            <Link
              to="/blacklist"
              className="text-sm font-medium transition-colors flex items-center gap-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Blacklist
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
              }}
            >
              {dark ? (
                <Sun size={18} style={{ color: 'var(--color-accent-yellow)' }} />
              ) : (
                <Moon size={18} style={{ color: 'var(--color-accent-blue)' }} />
              )}
            </button>

            {/* Upload CVs Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <UploadCloud size={16} />
              Upload CVs
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-tertiary)',
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ color: 'var(--color-text-primary)' }}>
        {children}
      </main>
    </div>
  );
}


