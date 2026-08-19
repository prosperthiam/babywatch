const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'BabyWatch <onboarding@resend.dev>';

// ── Email confirmation inscription ──
const sendConfirmationEmail = async (email, firstName, token) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;
  await resend.emails.send({
    from: FROM, to: email,
    subject: '✅ Confirmez votre compte BabyWatch',
    html: emailTemplate(`
      <h2>Bonjour ${firstName} 👋</h2>
      <p style="color:#94a3b8;">Merci de vous être inscrit ! Cliquez ci-dessous pour confirmer votre email.</p>
      <a href="${confirmUrl}" style="${btnStyle(G.teal)}">✅ Confirmer mon compte</a>
      <p style="color:#64748b;font-size:0.8rem;margin-top:20px;">Ce lien expire dans 24 heures.</p>
    `)
  });
};

// ── Email mot de passe oublié ──
const sendResetPasswordEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM, to: email,
    subject: '🔑 Réinitialisation de votre mot de passe BabyWatch',
    html: emailTemplate(`
      <h2>Bonjour ${firstName} 👋</h2>
      <p style="color:#94a3b8;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <a href="${resetUrl}" style="${btnStyle(G.teal)}">🔑 Réinitialiser mon mot de passe</a>
      <p style="color:#64748b;font-size:0.8rem;margin-top:20px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `)
  });
};

// ── Email nouvelle demande de garde (babysitter) ──
const sendNewBookingToSitter = async (sitterEmail, sitterName, booking) => {
  await resend.emails.send({
    from: FROM, to: sitterEmail,
    subject: '🍼 Nouvelle demande de garde — BabyWatch',
    html: emailTemplate(`
      <h2>Bonjour ${sitterName} 👋</h2>
      <p style="color:#94a3b8;">Vous avez reçu une nouvelle demande de garde !</p>
      ${bookingCard(booking)}
      <div style="display:flex;gap:12px;margin-top:20px;">
        <a href="${process.env.FRONTEND_URL}" style="${btnStyle('#4ade80')}">✅ Accepter</a>
        <a href="${process.env.FRONTEND_URL}" style="${btnStyle('#ff5f57')}">❌ Refuser</a>
      </div>
      <p style="color:#64748b;font-size:0.8rem;margin-top:16px;">Connectez-vous sur BabyWatch pour gérer cette demande.</p>
    `)
  });
};

// ── Email réservation confirmée (parent) ──
const sendBookingConfirmedToParent = async (parentEmail, parentName, booking, sitterName) => {
  await resend.emails.send({
    from: FROM, to: parentEmail,
    subject: '🎉 Garde confirmée — BabyWatch',
    html: emailTemplate(`
      <h2>Bonne nouvelle ${parentName} ! 🎉</h2>
      <p style="color:#94a3b8;"><strong style="color:#4ade80;">${sitterName}</strong> a accepté votre demande de garde !</p>
      ${bookingCard(booking)}
      ${booking.camera ? `
        <div style="background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.3);border-radius:10px;padding:14px;margin-top:16px;">
          <p style="color:#2dd4bf;font-weight:700;margin:0;">📹 Surveillance caméra activée</p>
          <p style="color:#94a3b8;font-size:0.85rem;margin:6px 0 0;">Vous pourrez suivre la garde en direct depuis l'application.</p>
        </div>
      ` : ''}
      <a href="${process.env.FRONTEND_URL}" style="${btnStyle(G.teal)}">Voir ma réservation →</a>
    `)
  });
};

// ── Email réservation refusée (parent) ──
const sendBookingDeclinedToParent = async (parentEmail, parentName, booking, sitterName) => {
  await resend.emails.send({
    from: FROM, to: parentEmail,
    subject: '❌ Demande de garde refusée — BabyWatch',
    html: emailTemplate(`
      <h2>Bonjour ${parentName}</h2>
      <p style="color:#94a3b8;">Malheureusement, <strong style="color:#ff5f57;">${sitterName}</strong> n'est pas disponible pour cette garde.</p>
      ${bookingCard(booking)}
      <p style="color:#94a3b8;">Ne vous inquiétez pas, d'autres babysitters sont disponibles !</p>
      <a href="${process.env.FRONTEND_URL}" style="${btnStyle(G.teal)}">🔍 Trouver un autre babysitter →</a>
    `)
  });
};

// ── Email rappel 24h avant la garde (parent) ──
const sendReminderToParent = async (parentEmail, parentName, booking, sitterName) => {
  await resend.emails.send({
    from: FROM, to: parentEmail,
    subject: '⏰ Rappel — Garde demain avec BabyWatch',
    html: emailTemplate(`
      <h2>Rappel pour demain ! ⏰</h2>
      <p style="color:#94a3b8;">Bonjour ${parentName}, votre garde avec <strong style="color:#2dd4bf;">${sitterName}</strong> est prévue demain.</p>
      ${bookingCard(booking)}
      ${booking.camera ? `<a href="${process.env.FRONTEND_URL}" style="${btnStyle(G.teal)}">📹 Accéder à la caméra live →</a>` : `<a href="${process.env.FRONTEND_URL}" style="${btnStyle(G.teal)}">Voir ma réservation →</a>`}
    `)
  });
};

// ── Email rappel 24h avant la garde (babysitter) ──
const sendReminderToSitter = async (sitterEmail, sitterName, booking, parentName) => {
  await resend.emails.send({
    from: FROM, to: sitterEmail,
    subject: '⏰ Rappel — Mission demain avec BabyWatch',
    html: emailTemplate(`
      <h2>Rappel pour demain ! ⏰</h2>
      <p style="color:#94a3b8;">Bonjour ${sitterName}, votre mission chez <strong style="color:#fbbf24;">${parentName}</strong> est prévue demain.</p>
      ${bookingCard(booking)}
      <a href="${process.env.FRONTEND_URL}" style="${btnStyle('#fbbf24')}">Voir ma mission →</a>
    `)
  });
};

// ── Email nouvel document identité soumis (admin) ──
const sendNewVerificationToAdmin = async (adminEmail, sitterName, sitterEmail) => {
  await resend.emails.send({
    from: FROM, to: adminEmail,
    subject: '🪪 Nouvelle vérification d\'identité — BabyWatch Admin',
    html: emailTemplate(`
      <h2>Nouvelle vérification d'identité 🪪</h2>
      <p style="color:#94a3b8;"><strong style="color:#fff;">${sitterName}</strong> (${sitterEmail}) a soumis un document d'identité.</p>
      <a href="${process.env.FRONTEND_URL}" style="${btnStyle('#ff5f57')}">⚡ Accéder au panneau Admin →</a>
    `)
  });
};

// ── HELPERS ──
const G = { teal:'#2dd4bf', amber:'#fbbf24' };

const btnStyle = (color) => `
  display:inline-block;
  background:${color};
  color:${color==='#4ade80'||color==='#fbbf24'?'#0f1923':'#fff'};
  padding:14px 28px;
  border-radius:8px;
  text-decoration:none;
  font-weight:bold;
  font-size:1rem;
  margin-top:16px;
`;

const bookingCard = (booking) => `
  <div style="background:#1e2d40;border-radius:12px;padding:18px;margin:16px 0;border:1px solid rgba(255,255,255,0.08);">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><span style="color:#64748b;font-size:0.8rem;">📅 Date</span><br/><strong style="color:#fff;">${booking.date || '—'}</strong></div>
      <div><span style="color:#64748b;font-size:0.8rem;">⏰ Heure</span><br/><strong style="color:#fff;">${booking.time_start || booking.time || '—'}</strong></div>
      <div><span style="color:#64748b;font-size:0.8rem;">⏱ Durée</span><br/><strong style="color:#fff;">${booking.duration}h</strong></div>
      <div><span style="color:#64748b;font-size:0.8rem;">👶 Enfants</span><br/><strong style="color:#fff;">${booking.children}</strong></div>
      <div style="grid-column:1/-1;"><span style="color:#64748b;font-size:0.8rem;">📍 Adresse</span><br/><strong style="color:#fff;">${booking.address || '—'}</strong></div>
      <div><span style="color:#64748b;font-size:0.8rem;">💶 Prix</span><br/><strong style="color:#2dd4bf;font-size:1.1rem;">${booking.price}€</strong></div>
      ${booking.camera ? '<div><span style="color:#64748b;font-size:0.8rem;">📹 Caméra</span><br/><strong style="color:#2dd4bf;">Activée</strong></div>' : ''}
    </div>
  </div>
`;

const emailTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#0a0f1a;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:40px auto;padding:20px;">
      <div style="background:#0f1923;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <div style="background:linear-gradient(135deg,#162030,#0f1923);padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <h1 style="margin:0;color:#fff;font-size:1.5rem;">🍼 Baby<span style="color:#2dd4bf;">Watch</span></h1>
          <p style="margin:4px 0 0;color:#64748b;font-size:0.85rem;">La garde d'enfants en toute confiance</p>
        </div>
        <div style="padding:32px;">
          ${content}
        </div>
        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
          <p style="color:#64748b;font-size:0.75rem;margin:0;">© 2026 BabyWatch · <a href="${process.env.FRONTEND_URL}" style="color:#2dd4bf;">babywatch.vercel.app</a></p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

module.exports = {
  sendConfirmationEmail,
  sendResetPasswordEmail,
  sendNewBookingToSitter,
  sendBookingConfirmedToParent,
  sendBookingDeclinedToParent,
  sendReminderToParent,
  sendReminderToSitter,
  sendNewVerificationToAdmin,
};