import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as supabaseModule from '../../lib/supabase';

// Mock supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

const DummyPage = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while checking session', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    // Delay to keep loading state visible
    (supabaseModule.supabase.auth.getSession as any).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 200))
    );
    (supabaseModule.supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
      data: { subscription: mockSubscription },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DummyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Check for loading spinner with aria-label
    const loadingDiv = screen.getByLabelText('Loading');
    expect(loadingDiv).toBeDefined();
    expect(loadingDiv.querySelector('svg')).toBeTruthy();
  });

  it('redirects to /login when no session exists', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    (supabaseModule.supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: null },
    });
    (supabaseModule.supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
      data: { subscription: mockSubscription },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DummyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeDefined();
    });
  });

  it('renders protected component when session exists', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    (supabaseModule.supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
    });
    (supabaseModule.supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
      data: { subscription: mockSubscription },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DummyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeDefined();
    });
  });

  it('calls getSession on mount', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    (supabaseModule.supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: null },
    });
    (supabaseModule.supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
      data: { subscription: mockSubscription },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DummyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabaseModule.supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  it('unsubscribes from auth state changes on unmount', async () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscription = { unsubscribe: mockUnsubscribe };
    
    (supabaseModule.supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: null },
    });
    (supabaseModule.supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
      data: { subscription: mockSubscription },
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DummyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabaseModule.supabase.auth.getSession).toHaveBeenCalled();
    });

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
