// ============================================
// OTP STORE
// ============================================
// Codes are persisted in Supabase (public.otp_codes) when the backend has
// database credentials, so they survive restarts / Render free-tier sleeps
// and work across multiple instances. Falls back to process memory when the
// database is unavailable (local dev, or table not migrated yet).
//
// OTP_STORE=auto (default) | supabase | memory

const { getSupabaseAdmin, isSupabaseConfigured } = require('./supabase');

const TABLE = 'otp_codes';
const memory = new Map();
let warnedFallback = false;

function key(email, purpose) {
  return `${purpose}:${email}`;
}

function mode() {
  const requested = String(process.env.OTP_STORE || 'auto').trim().toLowerCase();
  if (requested === 'memory') return 'memory';
  if (requested === 'supabase') return 'supabase';
  return isSupabaseConfigured() ? 'supabase' : 'memory';
}

function fallback(error) {
  if (String(process.env.OTP_STORE || '').trim().toLowerCase() === 'supabase') throw error;
  if (!warnedFallback) {
    warnedFallback = true;
    console.warn(`[otp] Supabase OTP storage unavailable (${error.message}). Using in-memory storage — run supabase/migrations to fix.`);
  }
}

// Periodically evict expired in-memory codes.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [k, record] of memory) if (record.expiresAt + 60 * 60 * 1000 < now) memory.delete(k);
}, 10 * 60 * 1000);
if (sweeper.unref) sweeper.unref();

async function save(email, purpose, { otpHash, expiresAt }) {
  const record = { email, purpose, otpHash, attempts: 0, expiresAt, createdAt: Date.now() };
  if (mode() === 'supabase') {
    try {
      const db = getSupabaseAdmin();
      const del = await db.from(TABLE).delete().eq('email', email).eq('purpose', purpose);
      if (del.error) throw del.error;
      const { data, error } = await db.from(TABLE).insert({
        email,
        purpose,
        otpHash,
        attempts: 0,
        verified: false,
        expiresAt: new Date(expiresAt).toISOString(),
        createdAt: new Date(record.createdAt).toISOString()
      }).select('id').single();
      if (error) throw error;
      memory.delete(key(email, purpose));
      // Opportunistic cleanup of long-expired rows.
      db.from(TABLE).delete().lt('expiresAt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).then(() => {}, () => {});
      return { ...record, id: data.id, store: 'supabase' };
    } catch (error) {
      fallback(error);
    }
  }
  memory.set(key(email, purpose), record);
  return { ...record, store: 'memory' };
}

async function get(email, purpose) {
  const local = memory.get(key(email, purpose));
  if (local) return { ...local, store: 'memory' };
  if (mode() !== 'supabase') return null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('id,email,purpose,otpHash,attempts,expiresAt,createdAt')
      .eq('email', email)
      .eq('purpose', purpose)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      expiresAt: new Date(data.expiresAt).getTime(),
      createdAt: new Date(data.createdAt).getTime(),
      store: 'supabase'
    };
  } catch (error) {
    fallback(error);
    return null;
  }
}

async function incrementAttempts(record) {
  const attempts = (record.attempts || 0) + 1;
  if (record.store === 'memory') {
    const local = memory.get(key(record.email, record.purpose));
    if (local) local.attempts = attempts;
    return attempts;
  }
  const { error } = await getSupabaseAdmin().from(TABLE).update({ attempts }).eq('id', record.id);
  if (error) throw error;
  return attempts;
}

async function remove(email, purpose) {
  memory.delete(key(email, purpose));
  if (mode() !== 'supabase') return;
  try {
    const { error } = await getSupabaseAdmin().from(TABLE).delete().eq('email', email).eq('purpose', purpose);
    if (error) throw error;
  } catch (error) {
    fallback(error);
  }
}

function _clearMemory() {
  memory.clear();
}

module.exports = { save, get, incrementAttempts, remove, mode, _clearMemory };
