const { createClient } = require('@supabase/supabase-js');

// Lazily created so the server (and OTP email sending) still boots when the
// database is not configured. Previously a missing env var crashed the whole
// process on startup, which also took /api/otp/send down.

let client = null;

function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseAdmin() {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    const error = new Error('Database is not configured on the backend (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing).');
    error.status = 503;
    error.code = 'DB_NOT_CONFIGURED';
    error.expose = true;
    throw error;
  }
  client = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim(), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return client;
}

module.exports = { getSupabaseAdmin, isSupabaseConfigured };
