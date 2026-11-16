import { useEffect, useState, useRef } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export default function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      // Subscribe to auth state changes immediately
      const { data: authData } = supabase.auth.onAuthStateChange(
        (_, session) => {
          if (!isMounted) return;

          if (session) {
            setAuthState('authenticated');
          } else {
            setAuthState('unauthenticated');
          }
        }
      );

      subscriptionRef.current = authData?.subscription || null;

      // Get initial session
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (data?.session) {
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    }

    checkSession();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  if (authState === 'loading') {
    return (
      <div
        aria-label="Loading"
        className="flex items-center justify-center h-screen bg-gray-50"
      >
        <svg
          className="w-8 h-8 text-blue-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
