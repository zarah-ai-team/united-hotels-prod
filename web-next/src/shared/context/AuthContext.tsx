// AuthContext — single source of truth for the currently-logged-in user.
//
// Why this exists: the rest of the app was reading user data from
// localStorage which (a) goes stale fast and (b) makes "is the user logged
// in?" depend on a synchronous read of a string blob that nothing else can
// observe. Components had no way to react when the user logs in/out, so the
// nav bar and the booking form never updated. Hence: lots of "my session
// isn't sticking" reports.
//
// What we do instead:
//   • The auth TOKEN stays in localStorage (it's the only thing that needs
//     to survive a hard reload — reasonable SPA pattern).
//   • The user OBJECT lives in React state, hydrated from /api/users/me on
//     every app boot. So the user data you see is always fresh from the
//     server, and the moment login/logout fires every consumer re-renders.
//   • Components consume `useAuth()` instead of reading localStorage.
//
// This fixes both:
//   1. "I logged in but the site doesn't show I'm logged in" — Navigation
//      and the booking form now react to context state, not stale storage.
//   2. "Booking step asks for my email even though I'm logged in" — Step 2
//      reads `useAuth().user` and prefills.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, LoginRequest } from '@/shared/api/services';
import { STORAGE_KEYS } from '@/shared/config/api';

export interface AuthUser {
  id: number | string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isAdmin?: boolean;
  isManager?: boolean;
  role?: string | null;
  country?: string | null;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // `loading` is true while we resolve the initial /me call. UI consumers
  // can render a spinner instead of flashing the logged-out state.
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const fresh = await authService.getCurrentUser();
      setUser(fresh as AuthUser);
      return fresh as AuthUser;
    } catch (err) {
      // Stale / invalid token — clear it so future routes don't loop.
      try { window.localStorage.removeItem(STORAGE_KEYS.TOKEN); } catch {}
      try { window.localStorage.removeItem(STORAGE_KEYS.USER); } catch {}
      setUser(null);
      return null;
    }
  }, []);

  // Boot: read /me once on mount. Cancel-on-unmount-style guard so a quick
  // navigation away doesn't set state on an unmounted component.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthUser> => {
    const response = await authService.login(credentials);
    // authService.login persists the token to localStorage; we re-read /me
    // here so the user object lives in React state rather than relying on
    // any localStorage user blob.
    const fresh = (await authService.getCurrentUser()) as AuthUser;
    setUser(fresh);
    return fresh;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refresh,
  }), [user, loading, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
