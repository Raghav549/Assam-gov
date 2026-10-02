const { getSupabaseAdmin } = require('../utils/supabase');
const { HttpError } = require('../utils/httpError');

const PUBLIC_FIELDS_EXCLUDED = ['passwordHash'];

function toPublicUser(row) {
  if (!row) return null;
  const user = { ...row };
  for (const field of PUBLIC_FIELDS_EXCLUDED) delete user[field];
  return user;
}

function dbError(error) {
  // Surface schema problems clearly instead of a generic 500.
  const message = String(error && error.message || '');
  if (/column .*passwordHash|passwordHash.* does not exist|Could not find the 'passwordHash'/i.test(message)) {
    return new HttpError(500, 'Database schema is outdated: users."passwordHash" column is missing. Run supabase/migrations/20261002_custom_auth.sql.', { code: 'DB_SCHEMA' });
  }
  if (/invalid input syntax for type uuid|violates foreign key constraint .*uid/i.test(message)) {
    return new HttpError(500, 'Database schema is outdated: users.uid must not reference auth.users. Run supabase/migrations/20261002_custom_auth.sql.', { code: 'DB_SCHEMA' });
  }
  return error;
}

async function getUserByEmail(email) {
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)
    .maybeSingle();
  if (error) throw dbError(error);
  return data;
}

async function getUserByUid(uid) {
  const { data, error } = await getSupabaseAdmin().from('users').select('*').eq('uid', uid).maybeSingle();
  if (error) throw dbError(error);
  return data;
}

async function insertUser(profile) {
  const { data, error } = await getSupabaseAdmin().from('users').insert(profile).select('*').single();
  if (error) {
    if (error.code === '23505') throw new HttpError(409, 'An account with this email already exists.', { code: 'EMAIL_TAKEN' });
    throw dbError(error);
  }
  return data;
}

async function updatePasswordHash(uid, passwordHash) {
  const { error } = await getSupabaseAdmin()
    .from('users')
    .update({ passwordHash, updatedAt: new Date().toISOString() })
    .eq('uid', uid);
  if (error) throw dbError(error);
}

module.exports = { toPublicUser, getUserByEmail, getUserByUid, insertUser, updatePasswordHash };
