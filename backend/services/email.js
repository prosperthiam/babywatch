const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendConfirmationEmail = async (email, firstName, token) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;
  
  await resend.emails.send({
    from: 'BabyWatch <onboarding@resend.dev>',
    to: email,
    subject: '✅ Confirmez votre compte BabyWatch',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
        <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
        <h2>Bonjour ${firstName} 👋</h2>
        <p style="color:#94a3b8;">
          Merci de vous être inscrit ! Cliquez ci-dessous pour confirmer votre email.
        </p>
        <a href="${confirmUrl}" 
           style="display:inline-block;background:#2dd4bf;color:#0f1923;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">
          ✅ Confirmer mon compte
        </a>
        <p style="color:#64748b;font-size:0.8rem;">
          Ce lien expire dans 24 heures.
        </p>
      </div>
    `
  });
};

module.exports = { sendConfirmationEmail };