// ============================================
// API BASE URL (single source of truth)
// ============================================
// Accepts REACT_APP_BACKEND_URL or REACT_APP_API_URL, with or without a
// trailing "/api" or "/". Previously three files built the URL three different
// ways (one produced ".../api/api/otp/send").
//
// Development: defaults to same-origin "/api" and CRA's "proxy" (package.json)
// forwards it to the backend on :5000.

const PRODUCTION_BACKEND_URL = 'https://youth-assam-backend.onrender.com';

function resolveApiBaseUrl() {
  const configured = (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '').trim();
  let base = configured;
  if (!base) base = process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND_URL : '';
  base = base.replace(/\/+$/, '').replace(/\/api$/i, '');
  return `${base}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();
