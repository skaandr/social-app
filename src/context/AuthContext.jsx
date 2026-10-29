import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../api/client';
import { getProfile } from '../api/users.api';
import { normalizeUser } from '../utils/normalize';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getProfile();
    const raw = res.data?.user ?? res.data;
    const u = normalizeUser(raw);
    setUser(u);
    return u;
  }, []);

  // Restore the session after a refresh.
  useEffect(() => {
    if (!token) { setBooting(false); return; }
    let alive = true;
    refreshUser()
      .catch(() => alive && clear())
      .finally(() => alive && setBooting(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', clear);
    return () => window.removeEventListener('auth:expired', clear);
  }, [clear]);

  /** Save a token from signin/signup/change-password, then load the profile. */
  const startSession = useCallback(async (newToken, fallbackUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    try { await refreshUser(); } catch {
      if (fallbackUser) setUser(normalizeUser(fallbackUser));
      else { clear(); throw new Error('Signed in, but your profile could not be loaded. Please try again.'); }
    }
  }, [refreshUser, clear]);

  const replaceToken = useCallback((t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }, []);

  const value = useMemo(
    () => ({ user, token, booting, isAuthed: Boolean(token && user), startSession, replaceToken, refreshUser, logout: clear }),
    [user, token, booting, startSession, replaceToken, refreshUser, clear]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
