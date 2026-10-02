# Youth Assam (Assam-gov)

React frontend + Express backend. Custom JWT authentication with email OTP
verification, Supabase for data/storage.

## Quick start (local)

```bash
npm install
cp .env.example .env        # fill in values
npm run dev                 # backend :5000 + React :3000 (proxied /api)
```

Test emails locally without a real mailbox:

```bash
npm run dev:inbox           # SMTP catcher on :2525, web inbox on http://localhost:8025
# in .env:
# EMAIL_PROVIDER=smtp EMAIL_HOST=127.0.0.1 EMAIL_PORT=2525 EMAIL_USER=dev@localhost
# EMAIL_PASS=dev EMAIL_TLS_REJECT_UNAUTHORIZED=false
```

## Email / OTP setup (important)

**Render's free plan blocks outbound SMTP (ports 25, 465, 587)**
([Render changelog](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)).
Gmail SMTP therefore *times out* on Render free regardless of the app password —
this is why verification codes were never delivered. The backend now supports
HTTPS email APIs, which are not blocked:

| Provider | Env vars | Notes |
|---|---|---|
| **Brevo** (recommended) | `BREVO_API_KEY` | Free 300/day. No domain needed — verify your Gmail as a sender. |
| Resend | `RESEND_API_KEY` | Needs a verified domain to email anyone but yourself. |
| SendGrid | `SENDGRID_API_KEY` | Requires a verified sender. |
| Gmail API | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | Sends from your Gmail over HTTPS. |
| SMTP | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | Local dev / paid hosting only. |

With `EMAIL_PROVIDER=auto` (default) every configured provider is used in the
order above, falling back to the next one if a provider fails.
`EMAIL_FROM` sets the sender (e.g. `Youth Assam <indian.tx.tl@gmail.com>`).

### Brevo in 3 minutes
1. Sign up at <https://www.brevo.com> → **Senders, domains & dedicated IPs → Senders** → add and verify `indian.tx.tl@gmail.com`.
2. **SMTP & API → API keys** → create a key.
3. In Render → Environment: `BREVO_API_KEY=<key>` and `EMAIL_FROM=Youth Assam <indian.tx.tl@gmail.com>` → redeploy.
4. Open `https://<backend>/api/health?fresh=1` → `"smtp": "ready"`, `"mail": {"provider": "brevo"}`.

### Gmail API (alternative)
1. Google Cloud Console → enable **Gmail API** → OAuth consent screen (External, **publish** it, otherwise refresh tokens expire after 7 days) → Credentials → OAuth client (Web), redirect URI `https://developers.google.com/oauthplayground`.
2. In <https://developers.google.com/oauthplayground> → ⚙️ “Use your own OAuth credentials” → scope `https://www.googleapis.com/auth/gmail.send` → authorize with the Gmail account → exchange for tokens → copy the **refresh token**.
3. Set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.

### Gmail SMTP (local / paid hosts)
`EMAIL_PASS` must be a 16-character **App Password** (Google Account → Security →
2-Step Verification → App passwords). Your normal password will not work.

### Diagnose
```bash
npm run mail:test                     # checks config + each provider
npm run mail:test -- you@example.com  # also sends a real test email
```
`GET /api/health?fresh=1` shows the active provider and, on failure, the error code and a hint.

| Symptom | Cause / fix |
|---|---|
| `ECONNECTION` / timeout on SMTP | Host blocks SMTP (Render free). Use Brevo / Gmail API. |
| `EAUTH` 535 on Gmail | Use an App Password; `EMAIL_USER` must be that Gmail address. |
| Brevo 401 | Wrong API key. Brevo 400 "sender not valid" → verify the sender email. |
| Resend 403 "testing emails" | Verify a domain in Resend, or use Brevo. |
| Browser shows "Cannot reach the server" | Add the frontend URL to `CLIENT_URL` (CORS) and check `REACT_APP_BACKEND_URL`. |
| First request slow | Render free sleeps; the frontend waits up to 70s and pre-warms the backend. |

## Database (Supabase)
* **New project:** run `supabase/schema.sql` in the SQL editor.
* **Existing project:** run `supabase/migrations/20261002_custom_auth.sql`
  (adds `passwordHash`, detaches `users.uid` from Supabase Auth, adds OTP purpose,
  blocks self-promotion to admin, hides password hashes). Safe to re-run.
* Make yourself admin: `update public.users set role = 'admin' where email = 'you@example.com';`
* For dashboard writes (posts, help requests, profile…) to pass Row Level Security,
  set `SUPABASE_JWT_SECRET` (Project Settings → JWT Keys → Legacy JWT secret) on the backend.

## API
| Method | Path | Body |
|---|---|---|
| POST | `/api/otp/send` (`/send-otp`, `/resend`) | `{ email }` |
| POST | `/api/otp/verify` (`/verify-otp`) | `{ email, otp }` → `verificationToken` |
| POST | `/api/auth/register` | `{ email, password, displayName, verificationToken }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | `Authorization: Bearer <token>` |
| POST | `/api/auth/forgot-password` | `{ email }` |
| POST | `/api/auth/reset-password` | `{ email, otp, password }` |
| GET | `/api/health` | `?fresh=1` re-checks email |

## Scripts
`npm test` (backend tests, incl. real SMTP round-trips) · `npm run build` · `npm start` · `npm run mail:test` · `npm run dev:inbox`
