// ============================================
// EMAIL TEMPLATES (plain text + HTML)
// ============================================
// Subjects are kept stable — the OTP E2E workflow matches
// /Youth Assam.*Email Verification OTP/.

const OTP_TTL_MINUTES = 10;
const BRAND = 'Youth Assam';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clientUrl() {
  const first = String(process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/+$/, '');
  return /^https?:\/\//.test(first) ? first : '';
}

function layout(title, bodyHtml) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f4f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<tr><td style="background:linear-gradient(90deg,#16a34a,#2563eb);background-color:#16a34a;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">${BRAND}</td></tr>
<tr><td style="padding:28px">
<h2 style="margin:0 0 12px;font-size:22px;color:#111827">${escapeHtml(title)}</h2>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px">This is an automated message from ${BRAND}. If you did not request it, you can safely ignore this email.</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function otpBlock(otp) {
  return `<div style="font-size:34px;font-weight:700;letter-spacing:10px;margin:20px 0;padding:14px 0;text-align:center;background:#f0fdf4;border:1px dashed #16a34a;border-radius:12px;color:#065f46">${escapeHtml(otp)}</div>`;
}

exports.OTP_TTL_MINUTES = OTP_TTL_MINUTES;
exports.escapeHtml = escapeHtml;

exports.verificationOtp = (otp) => ({
  subject: `${BRAND} — Email Verification OTP`,
  text: `Your ${BRAND} verification OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes. Do not share this code with anyone.`,
  html: layout('Verify your email', `<p>Your verification OTP is:</p>${otpBlock(otp)}<p>This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p><p>Please do not share this code with anyone.</p>`)
});

exports.passwordResetOtp = (otp) => ({
  subject: `${BRAND} — Password Reset Code`,
  text: `Your ${BRAND} password reset code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes. If you did not request a password reset, ignore this email — your password will not change.`,
  html: layout('Reset your password', `<p>Use this code to reset your password:</p>${otpBlock(otp)}<p>This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p><p>If you did not request a password reset, ignore this email — your password will not change.</p>`)
});

exports.welcome = (displayName) => {
  const url = clientUrl();
  const name = String(displayName || '').trim() || 'there';
  return {
    subject: `Welcome to ${BRAND}!`,
    text: `Hi ${name},\n\nYour ${BRAND} account has been created successfully. You can now explore scholarships, courses, government schemes and more.${url ? `\n\nSign in: ${url}/login` : ''}\n\n— Team ${BRAND}`,
    html: layout(`Welcome, ${name}!`, `<p>Your ${BRAND} account has been created successfully.</p><p>You can now explore scholarships, courses, government schemes and connect with the community.</p>${url ? `<p style="margin-top:24px"><a href="${escapeHtml(url)}/login" style="background:#16a34a;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Go to ${BRAND}</a></p>` : ''}<p style="margin-top:24px">— Team ${BRAND}</p>`)
  };
};

exports.passwordChanged = () => ({
  subject: `${BRAND} — Your password was changed`,
  text: `The password for your ${BRAND} account was just changed. If this was not you, reset your password immediately and contact support.`,
  html: layout('Password changed', `<p>The password for your ${BRAND} account was just changed.</p><p>If this was not you, reset your password immediately and contact support.</p>`)
});
