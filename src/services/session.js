// ============================================
// SESSION STORAGE (custom JWT auth)
// ============================================

const SESSION_KEY = 'youth_assam_session';
const listeners = new Set();

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(window.atob(payload))));
  } catch {
    return null;
  }
}

export function isTokenExpired(token, skewSeconds = 30) {
  const payload = token && decodeJwt(token);
  if (!payload) return true;
  return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now() + skewSeconds * 1000;
}

export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.token || !session?.user || isTokenExpired(session.token)) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  listeners.forEach((fn) => fn(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('authToken'); // legacy key
  listeners.forEach((fn) => fn(null));
}

export function getAuthToken() {
  return loadSession()?.token || null;
}

/** Token for the browser Supabase client (null → anon key). */
export function getSupabaseToken() {
  const token = loadSession()?.supabaseToken;
  return token && !isTokenExpired(token) ? token : null;
}

export function onSessionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
