import { useState, useEffect, useRef, Component } from "react";
// v2.1 - fix sitter profile
import { translations, useTranslation } from './translations.js';
const API = 'https://babywatch-production.up.railway.app/api';


const G = {
  night: "#0f1923", panel: "#162030", card: "#1e2d40",
  border: "rgba(255,255,255,0.08)", coral: "#ff5f57",
  teal: "#2dd4bf", green: "#4ade80", amber: "#fbbf24",
  purple: "#a78bfa", text: "#e2e8f0", muted: "#64748b",
  cream: "#f0f4ff", navH: 64,
};

// ─── ERROR BOUNDARY ───────────────────────────────────────────
// Évite l'écran blanc : capture les erreurs JS et affiche un message lisible.
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error) { return { hasError:true, error }; }
  componentDidCatch(error, info) { console.error("Erreur applicative :", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", background:G.night, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',sans-serif" }}>
          <div style={{ background:G.panel, border:`1px solid ${G.border}`, borderRadius:20, padding:40, maxWidth:460, textAlign:"center" }}>
            <div style={{ fontSize:"3rem", marginBottom:16 }}>😕</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:10 }}>
              Une erreur est survenue
            </div>
            <div style={{ color:G.muted, fontSize:"0.88rem", marginBottom:20, lineHeight:1.6 }}>
              L'application a rencontré un problème inattendu. Rechargez la page pour continuer.
            </div>
            {this.state.error && (
              <div style={{ background:"rgba(255,95,87,0.08)", border:`1px solid ${G.coral}33`, borderRadius:8, padding:"10px 12px", marginBottom:20, textAlign:"left" }}>
                <div style={{ color:G.coral, fontSize:"0.7rem", fontWeight:700, marginBottom:4 }}>DÉTAIL TECHNIQUE</div>
                <div style={{ color:G.muted, fontSize:"0.72rem", fontFamily:"monospace", wordBreak:"break-word" }}>
                  {String(this.state.error?.message || this.state.error)}
                </div>
              </div>
            )}
            <button onClick={() => window.location.reload()} style={{ background:G.teal, color:"#0f1923", border:"none", borderRadius:10, padding:"12px 26px", fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer", fontSize:"0.9rem" }}>
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Badge = ({ color = G.teal, children, style = {} }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:100, fontSize:"0.7rem", fontWeight:700, background: color+"22", color, border:`1px solid ${color}44`, ...style }}>{children}</span>
);

const Dot = ({ color, pulse }) => (
  <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:color, boxShadow: pulse ? `0 0 0 4px ${color}33` : "none", flexShrink:0, animation: pulse ? "bw-pulse 1.5s ease-in-out infinite" : "none" }} />
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background:G.card, borderRadius:14, border:`1px solid ${G.border}`, padding:"20px 22px", ...style, cursor: onClick ? "pointer" : "default" }}>{children}</div>
);

const Btn = ({ children, variant = "teal", size = "md", disabled, onClick, style = {}, full }) => {
  const variants = {
    teal:   { background:G.teal,   color:"#0f1923" },
    coral:  { background:G.coral,  color:"#fff" },
    amber:  { background:G.amber,  color:"#0f1923" },
    ghost:  { background:"rgba(255,255,255,0.06)", color:G.text, border:`1px solid ${G.border}` },
    danger: { background:"#ef444422", color:"#f87171", border:"1px solid #f8717144" },
    purple: { background:G.purple, color:"#0f1923" },
  };
  const sizes = { sm:"8px 14px", md:"10px 20px", lg:"13px 28px" };
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:sizes[size], borderRadius:10, border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize: size==="sm"?"0.78rem":size==="lg"?"1rem":"0.88rem", cursor: disabled?"not-allowed":"pointer", opacity: disabled?0.4:1, width: full?"100%":"auto", transition:"all 0.18s", ...variants[variant], ...style }}>{children}</button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, icon, style = {} }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{label}</label>}
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding: icon?"10px 14px 10px 38px":"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none", ...style }} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { confirmed:["Confirmée",G.green], pending:["En attente",G.amber], completed:["Terminée",G.muted], cancelled:["Annulée",G.coral] };
  const [label, color] = map[status] || ["—", G.muted];
  return <Badge color={color}>{label}</Badge>;
};

let toastTimer;
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "ok") => {
    setToast({ msg, type });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(null), 3200);
  };
  return [toast, show];
};

const Toast = ({ toast }) => (
  <div style={{ position:"fixed", bottom:28, left:"50%", transform:`translateX(-50%) translateY(${toast ? 0 : 60}px)`, opacity: toast ? 1 : 0, transition:"all 0.32s cubic-bezier(0.175,0.885,0.32,1.275)", background:G.card, border:`1px solid ${toast?.type==="ok"?G.green+"55":G.coral+"55"}`, color:G.text, padding:"11px 22px", borderRadius:12, fontWeight:600, fontSize:"0.83rem", zIndex:999, whiteSpace:"nowrap", pointerEvents:"none", boxShadow:"0 8px 32px #0006" }}>
    {toast?.msg}
  </div>
);

// ─── CONFIRM PAGE ─────────────────────────────────────────────
const ConfirmPage = ({ onLogin, t = (k) => k }) => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) { setStatus("error"); setMessage("Token manquant."); return; }
    fetch(`${API}/auth/confirm/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setStatus("success");
          setTimeout(() => onLogin(data.user), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Lien invalide.");
        }
      })
      .catch(() => { setStatus("error"); setMessage("Erreur de connexion."); });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>
          {status === "loading" ? "⏳" : status === "success" ? "🎉" : "❌"}
        </div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:12 }}>
          {status === "loading" ? "Vérification en cours…" : status === "success" ? "Compte confirmé !" : "Erreur"}
        </div>
        <div style={{ color:G.muted, fontSize:"0.9rem" }}>
          {status === "loading" ? "Patientez quelques secondes…"
           : status === "success" ? "Redirection vers votre tableau de bord…"
           : message}
        </div>
        {status === "error" && (
          <button onClick={() => window.location.href = "/"} style={{ marginTop:20, background:G.teal, color:"#0f1923", border:"none", borderRadius:10, padding:"12px 24px", fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer" }}>
            Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  );
};

// ─── FORGOT PASSWORD PAGE ─────────────────────────────────────
const ForgotPasswordPage = ({ onBack, t = (k) => k }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("form");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Entrez votre email."); return; }
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStatus("sent");
    } catch(e) {
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>
        <div style={{ padding:"28px" }}>
          {status === "form" ? (
            <>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff", marginBottom:8 }}>🔑 Mot de passe oublié</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>{t('forgotPwSubtitle')}</div>
              <Input label={t('email')} type="email" value={email} onChange={setEmail} placeholder="vous@email.fr" icon="✉️" />
              {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}
              <Btn onClick={handleSubmit} variant="teal" size="lg" full>{t('sendLink')}</Btn>
              <button onClick={onBack} style={{ marginTop:14, width:"100%", background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>{t('backToLogin')}</button>
            </>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>📧</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:12 }}>{t('emailSent')}</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>{t('checkInboxReset')}</div>
              <Btn onClick={onBack} variant="ghost" full>{t('backToLogin')}</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RESET PASSWORD PAGE ──────────────────────────────────────
const ResetPasswordPage = ({ onBack, t = (k) => k }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("form");
  const [error, setError] = useState("");
  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async () => {
    if (!password || !confirm) { setError("Remplissez tous les champs."); return; }
    if (password.length < 6) { setError("Mot de passe trop court."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStatus("done");
    } catch(e) {
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>
        <div style={{ padding:"28px" }}>
          {status === "form" ? (
            <>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff", marginBottom:8 }}>🔑 Nouveau mot de passe</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>{t('chooseNewPw')}</div>
              <Input label={t('newPassword')} type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" />
              <Input label={t('confirmPassword')} type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" icon="🔒" />
              {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}
              <Btn onClick={handleSubmit} variant="teal" size="lg" full>{t('resetBtn')}</Btn>
            </>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>✅</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:12 }}>{t('pwUpdated')}</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>{t('canLoginNow')}</div>
              <Btn onClick={() => { window.history.pushState({}, "", "/"); onBack(); }} variant="teal" full>{t('loginBtn')}</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 2FA PAGE ─────────────────────────────────────────────────
const TwoFactorPage = ({ userId, onSuccess, onBack, t = (k) => k }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) { setError("Entrez le code à 6 chiffres."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      } else {
        setError(data.error);
      }
    } catch(e) { setError("Erreur de connexion."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>
        <div style={{ padding:"32px" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:"3rem", marginBottom:12 }}>🔐</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff", marginBottom:8 }}>{t('twoStepVerification')}</div>
            <div style={{ color:G.muted, fontSize:"0.85rem", lineHeight:1.6 }}>
              Un code à 6 chiffres a été envoyé à votre email. Entrez-le ci-dessous.
            </div>
          </div>

          {/* Input code stylisé */}
          <div style={{ marginBottom:20 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000"
              maxLength={6}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`2px solid ${code.length===6?G.teal:G.border}`, borderRadius:12, padding:"16px", color:G.text, fontFamily:"'Nunito',sans-serif", fontSize:"2rem", fontWeight:900, outline:"none", textAlign:"center", letterSpacing:"0.5em", transition:"border-color 0.2s" }}
            />
          </div>

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          <Btn onClick={handleVerify} variant="teal" size="lg" full disabled={loading||code.length!==6}>
            {loading ? "Vérification…" : "✅ Vérifier →"}
          </Btn>

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.82rem" }}>← Retour</button>
            <button onClick={async () => {
              setResending(true);
              // Renvoyer le code en relançant la connexion
              setTimeout(() => setResending(false), 3000);
            }} style={{ background:"none", border:"none", color:G.teal, cursor:"pointer", fontSize:"0.82rem", fontWeight:600 }}>
              {resending ? "Envoyé ✓" : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AUTH PAGE ────────────────────────────────────────────────
const AuthPage = ({ onLogin, t = (k) => k, onBackToLanding }) => {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
 const [show2FA, setShow2FA] = useState(false);
const [twoFAUserId, setTwoFAUserId] = useState(null);

const handleLogin = async () => {
  setError("");
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }

    // Si 2FA requis
    if (data.requires2FA) {
      setTwoFAUserId(data.userId);
      setShow2FA(true);
      return;
    }

    localStorage.setItem('token', data.token);
    onLogin(data.user);
  } catch(e) { setError("Erreur de connexion au serveur."); }
};

if (show2FA) return (
  <TwoFactorPage
    userId={twoFAUserId}
    onSuccess={onLogin}
    onBack={() => setShow2FA(false)}
    t={t}
  />
);

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Remplissez tous les champs."); return; }
    if (password.length < 6) { setError("Mot de passe trop court."); return; }
    try {
      const [firstName, ...rest] = name.split(' ');
      const lastName = rest.join(' ') || '';
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, firstName, lastName })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setError("");
      setSuccessMsg(data.message);
      setMode("success");
    } catch(e) {
      setError("Erreur de connexion au serveur.");
    }
  };


  if (mode === "forgot") return <ForgotPasswordPage onBack={() => setMode("login")} t={t} />;

  if (mode === "success") return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>📧</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff", marginBottom:12 }}>{t('checkYourEmail')}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:24, lineHeight:1.6 }}>
          Un email de confirmation a été envoyé à<br />
          <strong style={{ color:G.teal }}>{email}</strong>
        </div>
        <div style={{ background:G.card, borderRadius:12, padding:"16px", marginBottom:24, border:`1px solid ${G.border}` }}>
          <div style={{ fontSize:"0.82rem", color:G.muted, lineHeight:1.7 }}>
            📬 Ouvrez votre boîte mail<br />
            🔗 Cliquez sur le lien de confirmation<br />
            ✅ Votre compte sera activé automatiquement
          </div>
        </div>
        <button onClick={() => setMode("login")} style={{ background:"none", border:`1px solid ${G.border}`, color:G.muted, padding:"10px 20px", borderRadius:10, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.85rem" }}>
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus{border-color:${G.teal}!important;box-shadow:0 0 0 3px ${G.teal}22!important;outline:none!important}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
      `}</style>

      <div style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ fontSize:"2.8rem", marginBottom:8 }}>🍼</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"2rem", color:"#fff" }}>
          Baby<span style={{ color:G.teal }}>Watch</span>
        </div>
        <div style={{ color:G.muted, fontSize:"0.85rem", marginTop:4 }}>{t('tagline')}</div>
      </div>

      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:`1px solid ${G.border}` }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ padding:"14px", background: mode===m ? G.card : "transparent", color: mode===m ? G.text : G.muted, border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"0.88rem", cursor:"pointer", borderBottom: mode===m ? `2px solid ${G.teal}` : "2px solid transparent" }}>
              {m === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>

        <div style={{ padding:"28px" }}>
          {mode === "register" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
              {["parent","sitter"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ padding:"12px 8px", borderRadius:10, border:`2px solid ${role===r?(r==="parent"?G.teal:G.amber):G.border}`, background: role===r?(r==="parent"?G.teal+"22":G.amber+"22"):"transparent", color: role===r?(r==="parent"?G.teal:G.amber):G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"0.85rem", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:"1.5rem" }}>{r === "parent" ? "👨‍👧" : "👩"}</span>
                  {r === "parent" ? "Parent" : "Babysitter"}
                </button>
              ))}
            </div>
          )}

          {mode === "register" && <Input label={t('fullName')} value={name} onChange={setName} placeholder="Sophie Dupont" icon="👤" />}
          <Input label={t('email')} type="email" value={email} onChange={setEmail} placeholder="vous@email.fr" icon="✉️" />
          <Input label={t('password')} type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" />

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          {mode === "login"
            ? <Btn onClick={handleLogin} variant="teal" size="lg" full>{t('loginBtn')}</Btn>
            : <Btn onClick={handleRegister} variant={role==="sitter"?"amber":"teal"} size="lg" full>{t('createAccount')}</Btn>
          }

          {mode === "login" && (
            <button onClick={() => setMode("forgot")} style={{ marginTop:12, width:"100%", background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'Inter',sans-serif", textDecoration:"underline" }}>
              {t('forgotPassword')}
            </button>
          )}

        </div>
      </div>
      {onBackToLanding && (
        <button onClick={onBackToLanding} style={{ marginTop:18, background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'Inter',sans-serif" }}>
          {t('backToHome')}
        </button>
      )}
      <div style={{ color:G.muted, fontSize:"0.72rem", marginTop:14 }}>🔒 {t('secureConnection')}</div>
    </div>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────
const LandingPage = ({ onStart, onLogin, lang, onLangChange, t = (k) => k }) => {
  const [clock, setClock] = useState("20:14:07");

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date().toTimeString().slice(0,8)), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ background:G.night, minHeight:"100vh", color:G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .bw-wrap{max-width:1080px;margin:0 auto;padding:0 24px}
        .bw-hero{display:grid;grid-template-columns:1.1fr 0.9fr;gap:56px;align-items:center;padding:80px 0 96px}
        .bw-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .bw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
        .bw-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        @media(max-width:860px){
          .bw-hero{grid-template-columns:1fr;gap:40px;padding:48px 0 64px}
          .bw-grid3,.bw-steps{grid-template-columns:1fr}
          .bw-grid2{grid-template-columns:1fr;gap:28px}
          .bw-h1{font-size:2.2rem!important}
        }
        @keyframes bw-live{0%,100%{opacity:1}50%{opacity:0.25}}
        .bw-btn:focus-visible{outline:3px solid ${G.teal};outline-offset:3px}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* En-tête */}
      <header style={{ borderBottom:`1px solid ${G.border}`, position:"sticky", top:0, background:"rgba(15,25,35,0.92)", backdropFilter:"blur(10px)", zIndex:50 }}>
        <div className="bw-wrap" style={{ height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.25rem", color:"#fff" }}>
            🍼 Baby<span style={{ color:G.teal }}>Watch</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <select value={lang} onChange={e=>onLangChange(e.target.value)} aria-label="Langue"
              style={{ background:G.card, border:`1px solid ${G.border}`, color:G.text, borderRadius:8, padding:"7px 10px", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", cursor:"pointer", outline:"none" }}>
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="ar">🇸🇦 AR</option>
            </select>
            <button className="bw-btn" onClick={onLogin}
              style={{ background:"none", border:`1px solid ${G.border}`, color:G.text, borderRadius:10, padding:"9px 18px", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>
              {t('login')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bw-wrap bw-hero">
        <div>
          <h1 className="bw-h1" style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"3rem", lineHeight:1.1, color:"#fff", letterSpacing:"-0.02em", marginBottom:20 }}>
            {t('heroTitle')}
          </h1>
          <p style={{ color:G.muted, fontSize:"1.05rem", lineHeight:1.7, maxWidth:"52ch", marginBottom:32 }}>
            {t('heroSubtitle')}
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button className="bw-btn" onClick={onStart}
              style={{ background:G.teal, color:"#0f1923", border:"none", borderRadius:12, padding:"15px 30px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1rem", cursor:"pointer" }}>
              {t('heroCta')}
            </button>
            <button className="bw-btn" onClick={onStart}
              style={{ background:"rgba(255,255,255,0.06)", color:G.text, border:`1px solid ${G.border}`, borderRadius:12, padding:"15px 30px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1rem", cursor:"pointer" }}>
              {t('heroCtaSitter')}
            </button>
          </div>
          <p style={{ color:G.muted, fontSize:"0.8rem", marginTop:18 }}>{t('heroFree')}</p>
        </div>

        {/* Cadre caméra live */}
        <div>
          <div style={{ background:"#000", borderRadius:18, overflow:"hidden", position:"relative", aspectRatio:"4/3", border:`1px solid ${G.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#1a2b3d,#0d1620)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:"4.5rem", opacity:0.9 }}>🧸</div>
            </div>
            <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 16px", background:"linear-gradient(180deg,rgba(0,0,0,0.7),transparent)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(239,68,68,0.92)", padding:"4px 11px", borderRadius:100, fontSize:"0.66rem", fontWeight:800, color:"#fff", letterSpacing:"0.04em" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#fff", animation:"bw-live 1.4s ease-in-out infinite" }} />
                LIVE
              </span>
              <span style={{ color:"rgba(255,255,255,0.85)", fontSize:"0.78rem", fontWeight:600 }}>{clock}</span>
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"26px 16px 14px", background:"linear-gradient(0deg,rgba(0,0,0,0.8),transparent)", fontSize:"0.74rem", color:"rgba(255,255,255,0.7)" }}>
              {t('heroCameraCaption')}
            </div>
          </div>
          <p style={{ color:G.muted, fontSize:"0.78rem", marginTop:12, textAlign:"center" }}>{t('heroCameraNote')}</p>
        </div>
      </section>

      {/* Vérification — vraie séquence, donc numérotée */}
      <section style={{ background:G.panel, borderTop:`1px solid ${G.border}`, borderBottom:`1px solid ${G.border}`, padding:"72px 0" }}>
        <div className="bw-wrap">
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.9rem", color:"#fff", marginBottom:10 }}>
            {t('trustTitle')}
          </h2>
          <p style={{ color:G.muted, fontSize:"0.98rem", maxWidth:"58ch", marginBottom:40, lineHeight:1.7 }}>
            {t('trustSubtitle')}
          </p>
          <div className="bw-steps">
            {[
              [t('trustStep1'), t('trustStep1Desc')],
              [t('trustStep2'), t('trustStep2Desc')],
              [t('trustStep3'), t('trustStep3Desc')],
            ].map(([title, desc], i) => (
              <div key={title} style={{ borderTop:`2px solid ${i===2?G.green:G.teal}`, paddingTop:18 }}>
                <div style={{ color:i===2?G.green:G.teal, fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.6rem", marginBottom:8 }}>{i+1}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"1rem", marginBottom:6 }}>{title}</div>
                <div style={{ color:G.muted, fontSize:"0.87rem", lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="bw-wrap" style={{ padding:"72px 0" }}>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.9rem", color:"#fff", marginBottom:36 }}>
          {t('featuresTitle')}
        </h2>
        <div className="bw-grid3">
          {[
            ["👶", t('feat1'), t('feat1Desc')],
            ["💬", t('feat2'), t('feat2Desc')],
            ["🆘", t('feat3'), t('feat3Desc')],
            ["📅", t('feat4'), t('feat4Desc')],
            ["🗺️", t('feat5'), t('feat5Desc')],
            ["⭐", t('feat6'), t('feat6Desc')],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:14, padding:"22px 22px 24px" }}>
              <div style={{ fontSize:"1.7rem", marginBottom:12 }}>{icon}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"0.98rem", marginBottom:7 }}>{title}</div>
              <div style={{ color:G.muted, fontSize:"0.86rem", lineHeight:1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Crédit d'impôt */}
      <section style={{ background:"linear-gradient(135deg,#0f2b28,#0f1f35)", borderTop:`1px solid ${G.teal}33`, borderBottom:`1px solid ${G.teal}33`, padding:"72px 0" }}>
        <div className="bw-wrap bw-grid2">
          <div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.9rem", color:"#fff", marginBottom:14 }}>
              {t('cesuTitle')}
            </h2>
            <p style={{ color:G.muted, fontSize:"0.98rem", lineHeight:1.75, marginBottom:16, maxWidth:"52ch" }}>
              {t('cesuText')}
            </p>
            <p style={{ color:G.muted, fontSize:"0.8rem", lineHeight:1.6 }}>{t('cesuLegal')}</p>
          </div>
          <div style={{ background:"rgba(0,0,0,0.28)", border:`1px solid ${G.border}`, borderRadius:16, padding:"26px 28px" }}>
            {[
              [t('cesuLine1'), "240 €"],
              [t('cesuLine2'), "−120 €"],
            ].map(([label, val], i) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"12px 0", borderBottom:`1px solid ${G.border}` }}>
                <span style={{ color:G.muted, fontSize:"0.88rem" }}>{label}</span>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.05rem", color: i===1?G.green:G.text }}>{val}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", paddingTop:16 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"0.95rem" }}>{t('cesuLine3')}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.7rem", color:G.teal }}>120 €</span>
            </div>
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="bw-wrap" style={{ padding:"80px 0", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"2rem", color:"#fff", marginBottom:14 }}>
          {t('finalTitle')}
        </h2>
        <p style={{ color:G.muted, fontSize:"1rem", maxWidth:"48ch", margin:"0 auto 30px", lineHeight:1.7 }}>
          {t('finalSubtitle')}
        </p>
        <button className="bw-btn" onClick={onStart}
          style={{ background:G.teal, color:"#0f1923", border:"none", borderRadius:12, padding:"16px 38px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.02rem", cursor:"pointer" }}>
          {t('heroCta')}
        </button>
      </section>

      {/* Pied de page */}
      <footer style={{ borderTop:`1px solid ${G.border}`, padding:"36px 0" }}>
        <div className="bw-wrap" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div style={{ color:G.muted, fontSize:"0.82rem" }}>
            🍼 BabyWatch · {t('footerRights')}
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[t('footerTerms'), t('footerPrivacy'), t('footerContact')].map(l => (
              <span key={l} style={{ color:G.muted, fontSize:"0.82rem", cursor:"pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────
const Nav = ({ user, activePage, onNav, onLogout, lang, onLangChange }) => {
  const isParent = user.role === "parent";
  const t = useTranslation(lang);

  const navItems = isParent
    ? [
        { id:"home",     label:t('home'),     icon:"🏠" },
        { id:"search",   label:t('search'),   icon:"🔍" },
        { id:"map",      label:t('map'),       icon:"🗺️" },
        { id:"bookings", label:t('bookings'),  icon:"📋" },
        { id:"profile",  label:t('profile'),   icon:"👤" },
        { id:"camera",   label:t('camera'),    icon:"📹" },
        { id:"children", label:"Mes enfants", icon:"👶" },
      ]
    : [
        { id:"home",     label:t('home'),      icon:"🏠" },
        { id:"missions", label:t('missions'),  icon:"📋" },
        { id:"profile",  label:t('profile'),   icon:"👤" },
        { id:"camera",   label:t('camera'),    icon:"📹" },
        { id:"children", label:"Mes enfants", icon:"👶" },
      ];
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;
  const fetchUnread = () => {
    fetch(`${API}/chat/unread/count`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUnreadCount(data.count || 0))
      .catch(console.error);
  };
  fetchUnread();
  const interval = setInterval(fetchUnread, 30000);
  return () => clearInterval(interval);
}, []);
    

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, height:G.navH, background:G.panel, borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", zIndex:100, boxShadow:"0 2px 20px #0005" }}>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.25rem", color:"#fff" }}>
        🍼 Baby<span style={{ color:G.teal }}>Watch</span>
        <span style={{ marginLeft:10, fontSize:"0.68rem", fontWeight:500, fontFamily:"'Inter',sans-serif", background: isParent?G.teal+"22":G.amber+"22", color: isParent?G.teal:G.amber, padding:"2px 8px", borderRadius:100 }}>
          {isParent ? "👨‍👧 Parent" : "👩 Babysitter"}
        </span>
      </div>
      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background: activePage===item.id?(isParent?G.teal+"22":G.amber+"22"):"transparent", color: activePage===item.id?(isParent?G.teal:G.amber):G.muted, fontFamily:"'Inter',sans-serif", fontWeight: activePage===item.id?600:400, fontSize:"0.85rem", cursor:"pointer" }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, borderRadius:10, padding:"7px 12px", border:`1px solid ${G.border}` }}>
          <span style={{ fontSize:"1.3rem" }}>{user.avatar}</span>
          <div>
            <div style={{ fontSize:"0.78rem", fontWeight:600, color:G.text }}>{user.name?.split(" ")[0]}</div>
            <div style={{ fontSize:"0.65rem", color:G.muted }}>{user.email}</div>
          </div>
        </div>
        <select value={lang} onChange={e => onLangChange(e.target.value)} style={{ background:G.card, border:`1px solid ${G.border}`, color:G.text, borderRadius:8, padding:"6px 10px", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", cursor:"pointer", outline:"none" }}>
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
          <option value="ar">🇸🇦 AR</option>
        </select>
        <button onClick={onLogout} style={{ background:"rgba(255,95,87,0.12)", border:"1px solid rgba(255,95,87,0.25)", color:G.coral, padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>
          {t('logout')}
        </button>
      </div>
    </nav>
  );
};
// ─── PARENT HOME ──────────────────────────────────────────────
const ParentHome = ({ user, bookings, onNav, t = (k) => k }) => {
  const myBookings = bookings.filter(b => b.parentId === user.id);
  const upcoming = myBookings.filter(b => b.status==="confirmed"||b.status==="pending");
  const next = upcoming[0];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"linear-gradient(135deg,#1a2d45,#0f1f35)", borderRadius:18, padding:"32px 28px", border:`1px solid ${G.border}` }}>
        <div style={{ fontSize:"0.78rem", fontWeight:700, color:G.teal, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{t('hello')}</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:"#fff", marginBottom:6 }}>{user.name}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:20 }}>{t('parentWelcome')}</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={() => onNav("search")} variant="teal">{t('findSitter')}</Btn>
          <Btn onClick={() => onNav("camera")} variant="ghost">{t('liveCamera')}</Btn>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:t('upcomingBookings'),  val:upcoming.length,                                    icon:"📅", color:G.teal   },
          { label:t('pending'),           val:myBookings.filter(b=>b.status==="pending").length,   icon:"⏳", color:G.amber  },
          { label:t('completedBookings'), val:myBookings.filter(b=>b.status==="completed").length, icon:"✅", color:G.green  },
          { label:t('favoriteSitters'),   val:2,                                                   icon:"⭐", color:G.purple },
        ].map(s => (
          <Card key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:s.color }}>{s.val}</div>
            <div style={{ fontSize:"0.72rem", color:G.muted, marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      {next && (
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{t('nextBooking')}</div>
            <StatusBadge status={next.status} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:"2.5rem" }}>{next.sitterAvatar}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"#fff", marginBottom:3 }}>{next.sitterName}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📅 {next.date} · {next.time} · ⏱ {next.duration} · 👶 {next.children}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:2 }}>📍 {next.address}</div>
            </div>
            {next.camera && <Btn onClick={() => onNav("camera")} variant="teal" size="sm">📹 Live</Btn>}
          </div>
        </Card>
      )}
      <Card>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('recentHistory')}</div>
        {myBookings.filter(b=>b.status==="completed").slice(0,3).map(b => (
          <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
            <span style={{ fontSize:"1.5rem" }}>{b.sitterAvatar}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:"0.88rem", color:G.text }}>{b.sitterName}</div>
              <div style={{ color:G.muted, fontSize:"0.75rem" }}>{b.date} · {b.duration}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:G.text, fontWeight:700 }}>{b.price}€</div>
              {b.rating && <div style={{ color:G.amber, fontSize:"0.72rem" }}>{"⭐".repeat(b.rating)}</div>}
            </div>
          </div>
        ))}
        <button onClick={() => onNav("bookings")} style={{ marginTop:12, background:"none", border:"none", color:G.teal, fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>{t('seeAll')}</button>
      </Card>
    </div>
  );
};

// ─── CHILDREN MANAGER ─────────────────────────────────────────
const CHILD_AVATARS = ["👶","🧒","👦","👧","🍼","🧸"];

const ChildrenManager = ({ showToast, t = (k) => k }) => {
  const [children, setChildren] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const load = () => {
    fetch(`${API}/children`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setChildren(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, []);

  const remove = async (id) => {
    if (!confirm(t('confirmDeleteChild'))) return;
    await fetch(`${API}/children/${id}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
    setChildren(prev => prev.filter(c => c.id !== id));
    showToast(t('childDeleted'), "err");
  };

  const age = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / 31557600000);
    if (years < 1) return `${Math.floor(diff / 2629800000)} mois`;
    return `${years} an${years>1?'s':''}`;
  };

  if (editing !== null) return (
    <ChildForm
      child={editing}
      onCancel={() => setEditing(null)}
      onSaved={(saved) => {
        setChildren(prev => editing.id ? prev.map(c => c.id===saved.id?saved:c) : [...prev, saved]);
        setEditing(null);
        showToast(t('childSaved'), "ok");
      }}
      showToast={showToast}
      t={t}
    />
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff" }}>{t('myChildren')}</div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('childrenSubtitle')}</div>
        </div>
        <Btn onClick={() => setEditing({})} variant="teal">{t('addChild')}</Btn>
      </div>

      {loading && <div style={{ color:G.muted, textAlign:"center", padding:30 }}>{t('loading')}</div>}

      {!loading && children.length === 0 && (
        <Card style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>👶</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:8 }}>{t('noChildren')}</div>
          <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>{t('childrenSubtitle')}</div>
          <Btn onClick={() => setEditing({})} variant="teal">{t('createFirstProfile')}</Btn>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
        {children.map(c => (
          <Card key={c.id}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              <span style={{ fontSize:"2.5rem" }}>{c.avatar || "👶"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"1.05rem" }}>{c.first_name}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>
                  {age(c.birth_date) ? `🎂 ${age(c.birth_date)}` : ''}
                  {c.bedtime ? ` · 🌙 ${c.bedtime.slice(0,5)}` : ''}
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setEditing(c)} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${G.border}`, color:G.text, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:"0.75rem" }}>✏️</button>
                <button onClick={() => remove(c.id)} style={{ background:"rgba(255,95,87,0.12)", border:"1px solid rgba(255,95,87,0.25)", color:G.coral, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:"0.75rem" }}>🗑</button>
              </div>
            </div>

            {c.allergies && (
              <div style={{ background:"rgba(255,95,87,0.1)", border:`1px solid ${G.coral}33`, borderRadius:8, padding:"8px 12px", marginBottom:8 }}>
                <div style={{ color:G.coral, fontSize:"0.7rem", fontWeight:700, marginBottom:2 }}>{t('allergies')}</div>
                <div style={{ color:G.text, fontSize:"0.8rem" }}>{c.allergies}</div>
              </div>
            )}
            {c.medications && (
              <div style={{ background:"rgba(251,191,36,0.1)", border:`1px solid ${G.amber}33`, borderRadius:8, padding:"8px 12px", marginBottom:8 }}>
                <div style={{ color:G.amber, fontSize:"0.7rem", fontWeight:700, marginBottom:2 }}>{t('medications')}</div>
                <div style={{ color:G.text, fontSize:"0.8rem" }}>{c.medications}</div>
              </div>
            )}
            {c.routines && (
              <div style={{ fontSize:"0.78rem", color:G.muted, lineHeight:1.5, marginTop:6 }}>
                <strong style={{ color:G.text }}>{t('routines')} :</strong> {c.routines}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── CHILD FORM ───────────────────────────────────────────────
const ChildForm = ({ child, onCancel, onSaved, showToast, t = (k) => k }) => {
  const [firstName, setFirstName] = useState(child.first_name || "");
  const [birthDate, setBirthDate] = useState(child.birth_date?.slice(0,10) || "");
  const [gender, setGender] = useState(child.gender || "");
  const [avatar, setAvatar] = useState(child.avatar || "👶");
  const [allergies, setAllergies] = useState(child.allergies || "");
  const [medicalNotes, setMedicalNotes] = useState(child.medical_notes || "");
  const [medications, setMedications] = useState(child.medications || "");
  const [routines, setRoutines] = useState(child.routines || "");
  const [favoriteActivities, setFavoriteActivities] = useState(child.favorite_activities || "");
  const [fears, setFears] = useState(child.fears || "");
  const [bedtime, setBedtime] = useState(child.bedtime?.slice(0,5) || "");
  const [doctorName, setDoctorName] = useState(child.doctor_name || "");
  const [doctorPhone, setDoctorPhone] = useState(child.doctor_phone || "");
  const [emergencyContactName, setEmergencyContactName] = useState(child.emergency_contact_name || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(child.emergency_contact_phone || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!firstName.trim()) { showToast(t('firstNameRequired'), "err"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const body = { firstName, birthDate, gender, avatar, allergies, medicalNotes, medications,
        routines, favoriteActivities, fears, bedtime, doctorName, doctorPhone,
        emergencyContactName, emergencyContactPhone };
      const res = await fetch(child.id ? `${API}/children/${child.id}` : `${API}/children`, {
        method: child.id ? 'PUT' : 'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) onSaved(data);
      else showToast("❌ " + data.error, "err");
    } catch(e) { showToast("❌ " + t('connectionError'), "err"); }
    setSaving(false);
  };

  return (
    <div>
      <button onClick={onCancel} style={{ background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.85rem", marginBottom:18 }}>{t('back')}</button>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff" }}>
          {child.id ? t('editChildForm') : t('newChildForm')}
        </div>
        <Btn onClick={save} variant="teal" disabled={saving}>{saving ? t('saving') : t('save')}</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>👶 {t('identity')}</div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>{t('childAvatar')}</label>
            <div style={{ display:"flex", gap:8 }}>
              {CHILD_AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{ fontSize:"1.6rem", background: avatar===a?G.teal+"22":"rgba(255,255,255,0.04)", border:`2px solid ${avatar===a?G.teal:G.border}`, borderRadius:10, padding:"6px 10px", cursor:"pointer" }}>{a}</button>
              ))}
            </div>
          </div>
          <Input label={t('childFirstName') + " *"} value={firstName} onChange={setFirstName} placeholder="Emma" />
          <Input label={t('birthDate')} type="date" value={birthDate} onChange={setBirthDate} icon="🎂" />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('gender')}</label>
            <select value={gender} onChange={e=>setGender(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
              <option value="">{t('genderUnspecified')}</option>
              <option value="fille">{t('genderGirl')}</option>
              <option value="garcon">{t('genderBoy')}</option>
            </select>
          </div>
          <Input label={t('bedtime')} type="time" value={bedtime} onChange={setBedtime} icon="🌙" />
        </Card>

        <Card style={{ borderColor:G.coral+"33" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:6 }}>{t('healthSafety')}</div>
          <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:16 }}>{t('healthSafetySubtitle')}</div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.coral, marginBottom:6 }}>{t('allergies')}</label>
            <textarea value={allergies} onChange={e=>setAllergies(e.target.value)} placeholder={t('allergiesPlaceholder')} style={{ width:"100%", background:"rgba(255,95,87,0.06)", border:`1.5px solid ${G.coral}33`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.amber, marginBottom:6 }}>{t('medications')}</label>
            <textarea value={medications} onChange={e=>setMedications(e.target.value)} placeholder={t('medicationsPlaceholder')} style={{ width:"100%", background:"rgba(251,191,36,0.06)", border:`1.5px solid ${G.amber}33`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('medicalNotes')}</label>
            <textarea value={medicalNotes} onChange={e=>setMedicalNotes(e.target.value)} placeholder={t('medicalNotesPlaceholder')} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60 }} />
          </div>
        </Card>

        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('habits')}</div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('routines')}</label>
            <textarea value={routines} onChange={e=>setRoutines(e.target.value)} placeholder={t('routinesPlaceholder')} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:70 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('favoriteActivities')}</label>
            <textarea value={favoriteActivities} onChange={e=>setFavoriteActivities(e.target.value)} placeholder={t('activitiesPlaceholder')} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('fears')}</label>
            <textarea value={fears} onChange={e=>setFears(e.target.value)} placeholder={t('fearsPlaceholder')} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60 }} />
          </div>
        </Card>

        <Card style={{ borderColor:G.green+"33" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('emergencyContacts')}</div>
          <Input label={t('doctorName')} value={doctorName} onChange={setDoctorName} placeholder="Dr. Martin" icon="🩺" />
          <Input label={t('doctorPhone')} value={doctorPhone} onChange={setDoctorPhone} placeholder="+33 1 23 45 67 89" icon="📞" />
          <div style={{ height:1, background:G.border, margin:"6px 0 16px" }} />
          <Input label={t('emergencyContactName')} value={emergencyContactName} onChange={setEmergencyContactName} placeholder="Grand-mère Nicole" icon="👤" />
          <Input label={t('emergencyContactPhone')} value={emergencyContactPhone} onChange={setEmergencyContactPhone} placeholder="+33 6 12 34 56 78" icon="📞" />
        </Card>

      </div>
    </div>
  );
};
// ─── PARENT PROFILE ───────────────────────────────────────────
const ParentProfile = ({ user, showToast, t = (k) => k }) => {
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user.name?.split(" ")[1] || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("France");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/profile/parent`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.first_name)  setFirstName(data.first_name);
        if (data.last_name)   setLastName(data.last_name);
        if (data.phone)       setPhone(data.phone || "");
        if (data.address)     setAddress(data.address || "");
        if (data.postal_code) setPostalCode(data.postal_code || "");
        if (data.city)        setCity(data.city || "");
        if (data.country)     setCountry(data.country || "France");
        if (data.birth_date)  setBirthDate(data.birth_date?.slice(0,10) || "");
        if (data.birth_place) setBirthPlace(data.birth_place || "");
        if (data.two_factor_enabled !== undefined) setTwoFAEnabled(data.two_factor_enabled);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/parent`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace })
      });
      const data = await res.json();
      if (res.ok) showToast("✅ " + t('profileUpdated'), "ok");
      else showToast("❌ " + data.error, "err");
    } catch(e) { showToast("❌ " + t('connectionError'), "err"); }
    setSaving(false);
  };

  const toggleTwoFA = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auth/toggle-2fa`, {
        method:'POST',
        headers:{ 'Authorization':`Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { setTwoFAEnabled(data.enabled); showToast("✅ " + data.message, "ok"); }
      else showToast("❌ " + data.error, "err");
    } catch(e) { showToast("❌ " + t('connectionError'), "err"); }
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>
            {t('myProfile')}
          </div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('profileSubtitle')}</div>
        </div>
        <Btn onClick={handleSave} variant="teal" disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>
            {t('personalInfo')}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label={t('firstName')} value={firstName} onChange={setFirstName} placeholder="Sophie" />
            <Input label={t('lastName')}  value={lastName}  onChange={setLastName}  placeholder="Dupont" />
          </div>
          <Input label={t('phone')}      value={phone}      onChange={setPhone}      placeholder="+33 6 12 34 56 78" icon="📱" />
          <Input label={t('birthDate')}  type="date" value={birthDate} onChange={setBirthDate} icon="🎂" />
          <Input label={t('birthPlace')} value={birthPlace} onChange={setBirthPlace} placeholder="Paris, France" icon="📍" />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>
              {t('country')}
            </label>
            <select value={country} onChange={e=>setCountry(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
              {["France","Belgique","Suisse","Canada","Maroc","Sénégal","Côte d'Ivoire","Algérie","Tunisie","Autre"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>
            {t('fullAddress')}
          </div>
          <Input label={t('address')} value={address} onChange={setAddress} placeholder="12 rue de la Paix" icon="🏠" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
            <Input label={t('postalCode')} value={postalCode} onChange={setPostalCode} placeholder="75001" />
            <Input label={t('city')}       value={city}       onChange={setCity}       placeholder="Paris" icon="📍" />
          </div>
          <div style={{ background:G.teal+"11", border:`1px solid ${G.teal}33`, borderRadius:10, padding:14, marginTop:8 }}>
            <div style={{ fontSize:"0.78rem", color:G.muted, lineHeight:1.7 }}>
              {t('addressPrivacy')}
            </div>
          </div>
        </Card>

      </div>

      <Card style={{ marginTop:16 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>
          {t('security')}
        </div>
        <div onClick={toggleTwoFA} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", cursor:"pointer" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, color:G.text, fontSize:"0.88rem" }}>{t('twoFactor')}</div>
            <div style={{ color:G.muted, fontSize:"0.75rem", marginTop:2 }}>{t('twoFactorDesc')}</div>
          </div>
          <div style={{ width:44, height:24, background: twoFAEnabled?G.teal:"rgba(255,255,255,0.15)", borderRadius:12, position:"relative", flexShrink:0, transition:"background 0.25s" }}>
            <div style={{ position:"absolute", top:3, left: twoFAEnabled?23:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s" }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── SEARCH ───────────────────────────────────────────────────
  const SearchSitters = ({ onBook, showToast, t = (k) => k }) => {
  const [search, setSearch] = useState("");
  const [filterCam, setFilterCam] = useState(false);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Charge les vrais babysitters depuis l'API
  useEffect(() => {
    fetch(`${API}/profile/sitters/map`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data.map(s => ({
          id: s.id,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          avatar: "👩",
          city: s.city || "—",
          rating: s.rating ? parseFloat(s.rating).toFixed(1) : null,
          missions: s.total_missions || 0,
          price: s.hourly_rate ? parseFloat(s.hourly_rate) : 0,
          bio: s.bio || "",
          tags: Array.isArray(s.skills) ? s.skills : [],
          camera: !!s.accepts_camera,
          available: s.available !== false,
          verified: s.verification_status === "verified",
        })) : [];
        setSitters(list);
        setLoading(false);
      })
      .catch(() => { setLoadError(t('loadSittersError')); setLoading(false); });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/favorites`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setFavorites(Array.isArray(data) ? data.map(f => f.id) : []))
      .catch(console.error);
  }, []);

  const toggleFavorite = async (sitterId) => {
    const token = localStorage.getItem('token');
    const isFav = favorites.includes(sitterId);
    if (isFav) {
      await fetch(`${API}/favorites/${sitterId}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
      setFavorites(prev => prev.filter(id => id !== sitterId));
      showToast("💔 Retiré des favoris", "err");
    } else {
      await fetch(`${API}/favorites/${sitterId}`, { method:'POST', headers:{ 'Authorization':`Bearer ${token}` } });
      setFavorites(prev => [...prev, sitterId]);
      showToast("❤️ Ajouté aux favoris !", "ok");
    }
  };

  const q = search.toLowerCase();
  const filtered = sitters.filter(s =>
    (s.name.toLowerCase().includes(q) ||
     s.city.toLowerCase().includes(q) ||
     s.tags.some(tag => String(tag).toLowerCase().includes(q))) &&
    (!filterCam || s.camera)
  );

  if (selected) return <BookingForm sitter={selected} onBack={() => setSelected(null)} onConfirm={(b) => { onBook(b); setSelected(null); showToast("🎉 Demande envoyée !", "ok"); }} t={t} />;

  return (
    <div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:4 }}>
        {t('findSitterTitle')}
      </div>
      <div style={{ color:G.muted, fontSize:"0.88rem", marginBottom:20 }}>
        {t('allVerified')}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          style={{ flex:1, background:G.card, border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 16px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}
        />
        <button onClick={() => setFilterCam(!filterCam)} style={{ padding:"10px 16px", borderRadius:10, border:`1.5px solid ${filterCam?G.teal:G.border}`, background:filterCam?G.teal+"22":"transparent", color:filterCam?G.teal:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" }}>
          {t('cameraOnly')}
        </button>
      </div>

      {loading && <div style={{ textAlign:"center", padding:40, color:G.muted }}>{t('loading')}</div>}

      {loadError && (
        <Card style={{ textAlign:"center", padding:30, borderColor:G.coral+"44" }}>
          <div style={{ fontSize:"2rem", marginBottom:10 }}>⚠️</div>
          <div style={{ color:G.coral, fontSize:"0.88rem" }}>{loadError}</div>
        </Card>
      )}

      {!loading && !loadError && filtered.length === 0 && (
        <Card style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🔍</div>
          <div style={{ color:G.muted, fontSize:"0.88rem" }}>{t('noSitterFound')}</div>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
        {filtered.map(s => (
          <Card key={s.id}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:12 }}>
              <span style={{ fontSize:"2.2rem" }}>{s.avatar}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{s.name}</span>
                  {s.available ? <Dot color={G.green} pulse /> : <Dot color={G.muted} />}
                </div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>🎂 {s.age} {t('yearsOld')} · 📍 {s.city}</div>
              </div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.1rem" }}>
                {s.price}€<span style={{ fontSize:"0.65rem", color:G.muted }}>/h</span>
              </div>
            </div>

            <div style={{ fontSize:"0.8rem", color:G.muted, marginBottom:12, lineHeight:1.5 }}>{s.bio}</div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
              {s.verified && <Badge color={G.green}>{t('verified')}</Badge>}
              {s.tags.map(tag => <Badge key={tag} color={G.purple}>{tag}</Badge>)}
              {s.camera && <Badge color={G.teal}>📹 {t('cameraBadge')}</Badge>}
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`1px solid ${G.border}`, paddingTop:12 }}>
              <div style={{ fontSize:"0.82rem", color:G.muted }}>⭐ {s.rating || "—"} · {s.missions} {t('bookingsCount')}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{ background:"none", border:"none", fontSize:"1.3rem", cursor:"pointer", padding:4 }}>
                  {favorites.includes(s.id) ? "❤️" : "🤍"}
                </button>
                <Btn onClick={() => s.available && setSelected(s)} variant={s.available?"teal":"ghost"} size="sm" disabled={!s.available}>
                  {s.available ? t('book') : t('unavailable')}
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
// ─── BOOKING FORM ─────────────────────────────────────────────
const BookingForm = ({ sitter, onBack, onConfirm, t = (k) => k }) => {
  const [showPayment, setShowPayment] = useState(false);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [date, setDate] = useState(tomorrow.toISOString().slice(0,10));
  const [time, setTime] = useState("18:30");
  const [duration, setDuration] = useState("3");
  const [myChildren, setMyChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/children`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMyChildren(Array.isArray(d)?d:[]))
      .catch(console.error);
  }, []);

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [camera, setCamera] = useState(sitter.camera);
  const price = parseInt(duration) * sitter.price + (camera ? parseInt(duration) * 2 : 0);
  const childrenCount = selectedChildren.length || 1;

  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.85rem", marginBottom:20 }}>{t('back')}</button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#fff", marginBottom:20 }}>{t('bookingDetails')}</div>
          <Input label={t('date')} type="date" value={date} onChange={setDate} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label={t('startTime')} type="time" value={time} onChange={setTime} />
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('duration')}</label>
              <select value={duration} onChange={e=>setDuration(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                {["2","3","4","5","6"].map(d=><option key={d} value={d}>{d}h</option>)}
              </select>
            </div>
          </div>
          <Input label={t('address')} value={address} onChange={setAddress} placeholder="12 rue de la Paix, 75001 Paris" icon="📍" />
          <Input label={t('notes')} value={notes} onChange={setNotes} placeholder="Allergies, routines, code d'entrée…" />
          {sitter.camera && (
            <div onClick={() => setCamera(!camera)} style={{ display:"flex", alignItems:"center", gap:14, background:camera?G.teal+"18":"rgba(255,255,255,0.04)", border:`1.5px solid ${camera?G.teal+"44":G.border}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", marginBottom:20 }}>
              <div style={{ width:44, height:24, background:camera?G.teal:"rgba(255,255,255,0.15)", borderRadius:12, position:"relative", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left:camera?23:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s" }} />
              </div>
              <div>
                <div style={{ fontWeight:700, color:camera?G.teal:G.text, fontSize:"0.88rem" }}>{t('cameraOption')}</div>
                <div style={{ color:G.muted, fontSize:"0.75rem" }}>{t('cameraDesc')}</div>
              </div>
            </div>
          )}
          {showPayment && (
            <PaymentModal
              booking={{ id:"temp", sitterName:sitter.name, date, time, duration:duration+"h", children:childrenCount, address, camera, price }}
              onClose={() => setShowPayment(false)}
              onSuccess={() => onConfirm({ id:"BK"+Date.now(), sitterId:sitter.id, sitterName:sitter.name, sitterAvatar:sitter.avatar, date, time, duration:duration+"h", children:childrenCount, address, notes, camera, status:"confirmed", price, createdAt:new Date().toISOString().slice(0,10) })}
              showToast={() => {}}
              t={t}
            />
          )}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>{t('childrenToWatch')}</label>
            {myChildren.length === 0 ? (
              <div style={{ background:G.night, border:`1px dashed ${G.border}`, borderRadius:10, padding:"14px", fontSize:"0.82rem", color:G.muted, textAlign:"center" }}>
                {t('noChildProfiles')}
              </div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {myChildren.map(c => {
                  const on = selectedChildren.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => setSelectedChildren(prev => on ? prev.filter(i=>i!==c.id) : [...prev, c.id])}
                      style={{ display:"flex", alignItems:"center", gap:8, background: on?G.teal+"22":"rgba(255,255,255,0.04)", border:`2px solid ${on?G.teal:G.border}`, borderRadius:12, padding:"8px 14px", cursor:"pointer", color: on?G.teal:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.85rem" }}>
                      <span style={{ fontSize:"1.3rem" }}>{c.avatar||"👶"}</span>
                      {c.first_name}
                      {c.allergies && <span title={t('allergies')} style={{ fontSize:"0.7rem" }}>⚠️</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Btn onClick={() => { if(!address){alert(t('addressRequired')); return;} setShowPayment(true); }} variant="teal" size="lg" full>
            {t('proceedPayment')}
          </Btn>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('sitterLabel')}</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <span style={{ fontSize:"2.5rem" }}>{sitter.avatar}</span>
              <div>
                <div style={{ fontWeight:700, color:"#fff" }}>{sitter.name}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {sitter.city} · ⭐ {sitter.rating}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('estimation')}</div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.82rem" }}>
              <span style={{ color:G.muted }}>{t('careLabel')} {duration}h × {sitter.price}€/h</span>
              <span style={{ color:G.text }}>{parseInt(duration)*sitter.price}€</span>
            </div>
            {camera && <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.82rem" }}>
              <span style={{ color:G.muted }}>{t('cameraBadge')} {duration}h × 2€/h</span>
              <span style={{ color:G.text }}>{parseInt(duration)*2}€</span>
            </div>}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>
              <span style={{ color:"#fff" }}>{t('totalEstimate')}</span>
              <span style={{ color:G.teal, fontSize:"1.2rem" }}>{price}€</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── REVIEW MODAL ─────────────────────────────────────────────
const ReviewModal = ({ booking, onClose, onSubmit, t = (k) => k }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!review.trim()) { setError("Écrivez un commentaire."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/reviews/${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, review })
      });
      const data = await res.json();
      if (res.ok) { onSubmit(booking.id, rating, review); }
      else { setError(data.error); }
    } catch(e) {
      setError("Erreur de connexion.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 24px 80px #0008", animation:"slideUp 0.3s ease" }}>
        <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div style={{ background:G.night, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.2rem", color:"#fff" }}>⭐ Laisser un avis</div>
            <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:4 }}>Garde avec {booking.sitterName} · {booking.date}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:G.muted, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
        </div>

        <div style={{ padding:"28px" }}>
          {/* Étoiles */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:10 }}>{t('globalRating')}</label>
            <div style={{ display:"flex", gap:8 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{ background:"none", border:"none", fontSize:"2rem", cursor:"pointer", opacity: star <= rating ? 1 : 0.25, transform: star <= rating ? "scale(1.1)" : "scale(1)", transition:"all 0.15s" }}>
                  ⭐
                </button>
              ))}
              <span style={{ color:G.muted, fontSize:"0.85rem", alignSelf:"center", marginLeft:8 }}>
                {["","Très insuffisant","Insuffisant","Bien","Très bien","Excellent !"][rating]}
              </span>
            </div>
          </div>

          {/* Critères */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              ["Ponctualité", "⏰"],
              ["Bienveillance", "💝"],
              ["Communication", "💬"],
              ["Propreté", "✨"],
            ].map(([label, icon]) => (
              <div key={label} style={{ background:G.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"1.2rem" }}>{icon}</span>
                <span style={{ fontSize:"0.78rem", color:G.muted }}>{label}</span>
                <span style={{ marginLeft:"auto", color:G.amber, fontSize:"0.8rem" }}>{"⭐".repeat(rating)}</span>
              </div>
            ))}
          </div>

          {/* Commentaire */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('yourComment')}</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder={t('reviewPlaceholder')}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"12px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:110, lineHeight:1.6 }}
            />
            <div style={{ textAlign:"right", fontSize:"0.72rem", color:G.muted, marginTop:4 }}>{review.length}/300</div>
          </div>

          {/* Tags rapides */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
            {["Ponctuel(le)","Bienveillant(e)","Organisé(e)","Enfants adorent","Très professionnel(le)","Je recommande"].map(tag => (
              <button key={tag} onClick={() => setReview(prev => prev ? prev + ", " + tag.toLowerCase() : tag)} style={{ background:G.teal+"11", border:`1px solid ${G.teal}33`, color:G.teal, borderRadius:100, padding:"4px 12px", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                + {tag}
              </button>
            ))}
          </div>

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={onClose} variant="ghost" full>{t('cancel')}</Btn>
            <Btn onClick={handleSubmit} variant="teal" full disabled={loading}>
              {loading ? "Publication…" : "✅ Publier mon avis →"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PARENT BOOKINGS ──────────────────────────────────────────
const ParentBookings = ({ user, bookings, onCancel, onNav, onReview, t = (k) => k }) => {
  const [filter, setFilter] = useState("all");
  const [reviewBooking, setReviewBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const my = bookings.filter(b => b.parentId === user.id);
  const tabs = ["all","pending","confirmed","completed"];
  const filtered = filter==="all" ? my : my.filter(b=>b.status===filter);

  return (
    <div>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={(id, rating, review) => {
            onReview(id, rating, review);
            setReviewBooking(null);
          }}
          t={t}
        />
      )}
      {chatBooking && (
        <ChatModal
          booking={chatBooking}
          user={user}
          onClose={() => setChatBooking(null)}
          t={t}
        />
      )}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>{t('myBookings')}</div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('bookingsSubtitle')}</div>
        </div>
        <Btn onClick={() => onNav("search")} variant="teal">{t('newBooking')}</Btn>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {tabs.map(id => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${filter===id?G.teal:G.border}`, background:filter===id?G.teal+"22":"transparent", color:filter===id?G.teal:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
            {t(id)}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px", color:G.muted }}>{t('noBookings')}</div>}
        {filtered.map(b => (
          <Card key={b.id}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
              <span style={{ fontSize:"2.2rem" }}>{b.sitterAvatar}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{b.sitterName}</span>
                  <StatusBadge status={b.status} />
                  {b.camera && <Badge color={G.teal}>📹 {t('cameraBadge')}</Badge>}
                  <span style={{ marginLeft:"auto", fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal }}>{b.price}€</span>
                </div>
                <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:4 }}>📅 {b.date} · {b.time} · ⏱ {b.duration} · 👶 {b.children} {b.children>1?t('childrenLabelPlural'):t('childrenLabel')}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {b.address}</div>
                {b.notes && <div style={{ fontSize:"0.75rem", color:G.muted, background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 10px", marginTop:8 }}>💬 {b.notes}</div>}

                {/* Avis existant */}
                {b.rating && (
                  <div style={{ marginTop:10, background:G.amber+"11", border:`1px solid ${G.amber}33`, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <span style={{ color:G.amber }}>{"⭐".repeat(b.rating)}</span>
                      <span style={{ fontSize:"0.72rem", color:G.muted }}>{t('yourReview')}</span>
                    </div>
                    {b.review && <div style={{ fontSize:"0.8rem", color:G.text, lineHeight:1.5 }}>"{b.review}"</div>}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {(b.status==="confirmed"||b.status==="pending") && <Btn onClick={() => setChatBooking(b)} variant="ghost" size="sm">{t('chat')}</Btn>}
                {b.camera && b.status==="confirmed" && <Btn onClick={() => onNav("camera")} variant="teal" size="sm">📹 Live</Btn>}
                {b.status==="pending" && <Btn onClick={() => onCancel(b.id)} variant="danger" size="sm">{t('cancel')}</Btn>}
                {b.status==="completed" && !b.rating && (
                  <Btn onClick={() => setReviewBooking(b)} variant="amber" size="sm">{t('rate')}</Btn>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── SITTER HOME ──────────────────────────────────────────────
const SitterHome = ({ user, bookings, onNav, t = (k) => k }) => {
  const my = bookings.filter(b => b.sitterId === user.id);
  const upcoming = my.filter(b=>b.status==="confirmed"||b.status==="pending");
  const earnings = my.filter(b=>b.status==="completed").reduce((s,b)=>s+b.price,0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"linear-gradient(135deg,#1a2510,#0f1a0a)", borderRadius:18, padding:"32px 28px", border:`1px solid ${G.amber}33` }}>
        <div style={{ fontSize:"0.78rem", fontWeight:700, color:G.amber, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
          {t('welcome')}
        </div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:"#fff", marginBottom:6 }}>{user.name}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:20 }}>{t('sitterWelcome')}</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={() => onNav("missions")} variant="amber">{t('myMissions')}</Btn>
          <Btn onClick={() => onNav("profile")} variant="ghost">{t('myProfileBtn')}</Btn>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:t('upcomingMissions'),   val:upcoming.length,                                  icon:"📅", color:G.amber },
          { label:t('pendingResponse'),    val:my.filter(b=>b.status==="pending").length,         icon:"⏳", color:G.coral },
          { label:t('completedMissions'),  val:my.filter(b=>b.status==="completed").length,       icon:"✅", color:G.green },
          { label:t('monthEarnings'),      val:earnings+"€",                                      icon:"💰", color:G.teal  },
        ].map(s => (
          <Card key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.6rem", color:s.color }}>{s.val}</div>
            <div style={{ fontSize:"0.72rem", color:G.muted, marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      {upcoming[0] && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{t('nextMission')}</div>
            <StatusBadge status={upcoming[0].status} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:"2rem" }}>👨‍👧</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"#fff" }}>{upcoming[0].parentName}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📅 {upcoming[0].date} · {upcoming[0].time} · ⏱ {upcoming[0].duration}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📍 {upcoming[0].address}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.2rem" }}>{upcoming[0].price}€</div>
              {upcoming[0].camera && <Badge color={G.teal} style={{marginTop:6}}>📹 {t('cameraBadge')}</Badge>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
// ─── SITTER MISSIONS ──────────────────────────────────────────
const SitterMissions = ({ user, bookings, onAccept, onDecline, t = (k) => k }) => {
  const [filter, setFilter] = useState("all");
  const [chatBooking, setChatBooking] = useState(null);
  const my = bookings.filter(b => b.sitterId === user.id);
  const tabs = ["all","toConfirm","confirmed","completed"];
  const filtered = filter==="all" ? my : filter==="toConfirm" ? my.filter(b=>b.status==="pending") : my.filter(b=>b.status===filter);

  return (
    <div>
      {chatBooking && (
        <ChatModal
          booking={chatBooking}
          user={user}
          onClose={() => setChatBooking(null)}
          t={t}
        />
      )}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>{t('myMissions')}</div>
        <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('missionsSubtitle')}</div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {tabs.map(id => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${filter===id?G.amber:G.border}`, background:filter===id?G.amber+"22":"transparent", color:filter===id?G.amber:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
            {t(id)}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px", color:G.muted }}>{t('noMissions')}</div>}
        {filtered.map(b => (
          <Card key={b.id}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <span style={{ fontSize:"2rem" }}>👨‍👧</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{b.parentName}</span>
                  <StatusBadge status={b.status} />
                  {b.camera && <Badge color={G.teal}>📹 {t('cameraBadge')}</Badge>}
                  <span style={{ marginLeft:"auto", fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal, fontSize:"1.1rem" }}>{b.price}€</span>
                </div>
                <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:4 }}>📅 {b.date} · {b.time} · ⏱ {b.duration} · 👶 {b.children} {b.children>1?t('childrenLabelPlural'):t('childrenLabel')}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {b.address}</div>
                {b.notes && <div style={{ fontSize:"0.75rem", color:G.muted, background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 10px", marginTop:8 }}>💬 {b.notes}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {(b.status==="confirmed"||b.status==="pending") && <Btn onClick={() => setChatBooking(b)} variant="ghost" size="sm">{t('chat')}</Btn>}
                {b.status==="pending" && (
                  <>
                    <Btn onClick={() => onAccept(b.id)} variant="teal" size="sm">{t('accept')}</Btn>
                    <Btn onClick={() => onDecline(b.id)} variant="danger" size="sm">{t('decline')}</Btn>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── AVAILABILITY CALENDAR ────────────────────────────────────
const DAY_KEYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

const AvailabilityCalendar = ({ showToast, t = (k) => k }) => {
  const [slots, setSlots] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/availability/me`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setSlots((data.slots||[]).map(s => ({ day:s.day_of_week, start:s.start_time.slice(0,5), end:s.end_time.slice(0,5) })));
        setExceptions(data.exceptions||[]);
      })
      .catch(console.error);
  }, []);

  const isSelected = (day, hour) => slots.some(s => s.day===day && hour >= s.start && hour < s.end);

  const toggleCell = (day, hour) => {
    const nextHour = HOURS[HOURS.indexOf(hour)+1] || "23:59";
    if (isSelected(day, hour)) {
      setSlots(prev => prev.filter(s => !(s.day===day && hour >= s.start && hour < s.end)));
    } else {
      setSlots(prev => [...prev, { day, start:hour, end:nextHour }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/availability/me`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ slots })
      });
      const data = await res.json();
      if (res.ok) showToast("✅ " + data.message, "ok");
      else showToast("❌ " + data.error, "err");
    } catch(e) { showToast("❌ Erreur de connexion.", "err"); }
    setSaving(false);
  };

  const blockDay = async () => {
    if (!blockDate) { showToast("⚠️ Choisissez une date.", "err"); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/availability/exception`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ date: blockDate, available:false, reason: blockReason })
      });
      const data = await res.json();
      if (res.ok) {
        setExceptions(prev => [...prev, { date: blockDate, available:false, reason: blockReason }]);
        setBlockDate(""); setBlockReason("");
        showToast("🚫 " + data.message, "ok");
      }
    } catch(e) { showToast("❌ Erreur de connexion.", "err"); }
  };

  const removeException = async (date) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/availability/exception/${date}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
    setExceptions(prev => prev.filter(e => e.date !== date));
    showToast("✅ Date rouverte.", "ok");
  };

  const totalHours = slots.length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff" }}>📅 Mes disponibilités</div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>Cliquez sur les créneaux où vous êtes disponible · {totalHours}h/semaine</div>
        </div>
        <Btn onClick={handleSave} variant="amber" disabled={saving}>{saving?"Sauvegarde…":"💾 Enregistrer"}</Btn>
      </div>

      {/* Grille hebdomadaire */}
      <Card style={{ marginBottom:20, overflowX:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:`70px repeat(7, minmax(70px,1fr))`, gap:3, minWidth:600 }}>
          <div />
          {DAY_KEYS.map(dk => { const d = t(dk); return (
            <div key={d} style={{ textAlign:"center", fontSize:"0.7rem", fontWeight:700, color:G.muted, paddingBottom:6 }}>
              {d.slice(0,3)}
            </div>
          ); })}
          {HOURS.slice(0,-1).map(hour => (
            <>
              <div key={"h"+hour} style={{ fontSize:"0.68rem", color:G.muted, textAlign:"right", paddingRight:8, alignSelf:"center" }}>{hour}</div>
              {DAY_KEYS.map((_, dayIdx) => {
                const on = isSelected(dayIdx, hour);
                return (
                  <div
                    key={dayIdx+hour}
                    onClick={() => toggleCell(dayIdx, hour)}
                    style={{
                      height:26,
                      borderRadius:5,
                      background: on ? G.green : "rgba(255,255,255,0.04)",
                      border: `1px solid ${on ? G.green : G.border}`,
                      cursor:"pointer",
                      transition:"all 0.12s",
                    }}
                  />
                );
              })}
            </>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:14, fontSize:"0.72rem", color:G.muted }}>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:12, height:12, borderRadius:3, background:G.green, display:"inline-block" }} /> Disponible
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:12, height:12, borderRadius:3, background:"rgba(255,255,255,0.04)", border:`1px solid ${G.border}`, display:"inline-block" }} /> Indisponible
          </span>
        </div>
      </Card>

      {/* Blocage de dates */}
      <Card>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:6 }}>🚫 Bloquer des dates</div>
        <div style={{ color:G.muted, fontSize:"0.8rem", marginBottom:14 }}>{t('availabilityBlockHint')}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr auto", gap:10, alignItems:"end" }}>
          <Input label={t('date')} type="date" value={blockDate} onChange={setBlockDate} />
          <Input label={t('reasonOptional')} value={blockReason} onChange={setBlockReason} />
          <div style={{ marginBottom:16 }}>
            <Btn onClick={blockDay} variant="danger">🚫 Bloquer</Btn>
          </div>
        </div>
        {exceptions.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
            {exceptions.map(e => (
              <span key={e.date} style={{ display:"inline-flex", alignItems:"center", gap:8, background:G.coral+"18", border:`1px solid ${G.coral}44`, color:G.coral, borderRadius:100, padding:"5px 12px", fontSize:"0.75rem", fontWeight:600 }}>
                {new Date(e.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}
                {e.reason ? ` · ${e.reason}` : ''}
                <button onClick={() => removeException(e.date)} style={{ background:"none", border:"none", color:G.coral, cursor:"pointer", lineHeight:1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
// ─── SITTER PROFILE ───────────────────────────────────────────
const SitterProfile = ({ user, bookings, showToast, t = (k) => k }) => {
  const my = bookings.filter(b => b.sitterId === user.id && b.status === "completed");
  const [tab, setTab] = useState("profile"); // profile | availability | identity | stats
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("unverified");

  // Champs du profil
  const [firstName, setFirstName] = useState(user.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user.name?.split(" ")[1] || "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("France");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("12");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [available, setAvailable] = useState(true);
  const [acceptsCamera, setAcceptsCamera] = useState(true);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Vérification identité
  const [docType, setDocType] = useState("carte_identite");
  const [docNumber, setDocNumber] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const geocodeAddress = async (addr, cty, postal) => {
    try {
      const query = `${addr} ${postal} ${cty} France`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch(e) { console.error(e); }
    return null;
  };

  const handleUploadId = async (file) => {
    if (!file) return;
    setUploadingDoc(true);
    setUploadError("");
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch(`${API}/profile/sitter/upload-id`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedUrl(data.url);
        setVerifyStatus("pending");
        showToast("✅ " + data.message, "ok");
      } else {
        setUploadError(data.error);
      }
    } catch(e) {
      setUploadError(t('connectionError'));
    }
    setUploadingDoc(false);
  };

  // Charger le profil
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/profile/sitter`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.first_name) setFirstName(data.first_name);
      if (data.last_name) setLastName(data.last_name);
      if (data.phone) setPhone(data.phone || "");
      if (data.city) setCity(data.city || "");
      if (data.address) setAddress(data.address || "");
      if (data.postal_code) setPostalCode(data.postal_code || "");
      if (data.country) setCountry(data.country || "France");
      if (data.birth_date) setBirthDate(data.birth_date?.slice(0,10) || "");
      if (data.birth_place) setBirthPlace(data.birth_place || "");
      if (data.bio) setBio(data.bio || "");
      if (data.hourly_rate) setHourlyRate(String(data.hourly_rate));
      if (data.skills) setSkills(data.skills || []);
      if (data.available !== undefined) setAvailable(data.available);
      if (data.accepts_camera !== undefined) setAcceptsCamera(data.accepts_camera);
      if (data.verification_status) setVerifyStatus(data.verification_status);
      if (data.two_factor_enabled !== undefined) setTwoFAEnabled(data.two_factor_enabled);
    })
    .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const coords = await geocodeAddress(address, city, postalCode);
      const res = await fetch(`${API}/profile/sitter/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          firstName, lastName, phone, address, postalCode, city,
          country, birthDate, birthPlace,
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
          bio, hourlyRate: parseFloat(hourlyRate),
          skills, available, acceptsCamera
        })
      });
      const data = await res.json();
      if (res.ok) showToast("✅ " + t('profileUpdated'), "ok");
      else showToast("❌ " + data.error, "err");
    } catch(e) {
      showToast("❌ " + t('connectionError'), "err");
    }
    setSaving(false);
  };

  const toggleTwoFA = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auth/toggle-2fa`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { setTwoFAEnabled(data.enabled); showToast(data.message, "ok"); }
      else showToast("❌ " + data.error, "err");
    } catch(e) {
      showToast("❌ " + t('connectionError'), "err");
    }
  };

  const handleVerifyIdentity = async () => {
    if (!docNumber || !birthDate) { showToast(t('fillAllFields'), "err"); return; }
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/sitter/verify-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ documentType: docType, documentNumber: docNumber, birthDate, firstName, lastName })
      });
      const data = await res.json();
      if (res.ok) { showToast("✅ " + data.message, "ok"); setVerifyStatus("pending"); }
      else showToast("❌ " + data.error, "err");
    } catch(e) {
      showToast("❌ " + t('connectionError'), "err");
    }
    setVerifying(false);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills(prev => [...prev, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const verifyBadge = () => {
    if (verifyStatus === "verified") return <Badge color={G.green}>{t('verified')}</Badge>;
    if (verifyStatus === "pending")  return <Badge color={G.amber}>{t('verifying')}</Badge>;
    return <Badge color={G.coral}>{t('notVerified')}</Badge>;
  };


  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <span style={{ fontSize:"3rem" }}>{user.avatar}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>{firstName} {lastName}</div>
          <div style={{ color:G.muted, fontSize:"0.85rem", marginTop:4 }}>{user.email}</div>
          <div style={{ marginTop:8 }}>{verifyBadge()}</div>
        </div>
        <Btn onClick={handleSave} variant="amber" disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:24, borderBottom:`1px solid ${G.border}`, paddingBottom:0 }}>
        {[["profile", t('myProfile')],["availability", "📅 " + t('availability')],["identity", t('identityVerification')],["stats", t('myStats')]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:"10px 18px", background:"none", border:"none", borderBottom: tab===id?`2px solid ${G.amber}`:"2px solid transparent", color: tab===id?G.amber:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.85rem", cursor:"pointer", marginBottom:"-1px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB PROFIL ── */}
      {tab === "profile" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('personalInfo')}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label={t('firstName')} value={firstName} onChange={setFirstName} placeholder="Camille" />
              <Input label={t('lastName')} value={lastName} onChange={setLastName} placeholder="Bertrand" />
            </div>
            <Input label={t('phone')} value={phone} onChange={setPhone} placeholder="+33 6 12 34 56 78" icon="📱" />
            <Input label={t('birthDate')} type="date" value={birthDate} onChange={setBirthDate} icon="🎂" />
            <Input label={t('birthPlace')} value={birthPlace} onChange={setBirthPlace} placeholder="Paris, France" icon="📍" />
            <Input label={t('address')} value={address} onChange={setAddress} placeholder="12 rue de la Paix" icon="🏠" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
              <Input label={t('postalCode')} value={postalCode} onChange={setPostalCode} placeholder="75011" />
              <Input label={t('city')} value={city} onChange={setCity} placeholder="Paris" icon="📍" />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('country')}</label>
              <select value={country} onChange={e=>setCountry(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                {["France","Belgique","Suisse","Canada","Maroc","Sénégal","Côte d'Ivoire","Algérie","Tunisie","Autre"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label={t('hourlyRate')} type="number" value={hourlyRate} onChange={setHourlyRate} placeholder="12" icon="💶" />
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('bioSkills')}</div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('bio')}</label>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder={t('bioPlaceholder')} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:100 }} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>{t('skills')}</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                {skills.map(s => (
                  <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:5, background:G.purple+"22", color:G.purple, border:`1px solid ${G.purple}44`, borderRadius:100, padding:"3px 10px", fontSize:"0.75rem", fontWeight:600 }}>
                    {s}
                    <button onClick={() => removeSkill(s)} style={{ background:"none", border:"none", color:G.purple, cursor:"pointer", fontSize:"0.8rem", lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyPress={e=>e.key==="Enter"&&addSkill()} placeholder={t('addSkill')} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"8px 12px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", outline:"none" }} />
                <Btn onClick={addSkill} variant="ghost" size="sm">{t('add')}</Btn>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('preferences')}</div>
            {[
              { label:t('availableForBookings'), sub:t('availableDesc'), val:available, set:setAvailable, color:G.green },
              { label:t('acceptCamera'), sub:t('acceptCameraDesc'), val:acceptsCamera, set:setAcceptsCamera, color:G.teal },
            ].map(opt => (
              <div key={opt.label} onClick={() => opt.set(!opt.val)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${G.border}`, cursor:"pointer" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:G.text, fontSize:"0.88rem" }}>{opt.label}</div>
                  <div style={{ color:G.muted, fontSize:"0.75rem", marginTop:2 }}>{opt.sub}</div>
                </div>
                <div style={{ width:44, height:24, background:opt.val?opt.color:"rgba(255,255,255,0.15)", borderRadius:12, position:"relative", flexShrink:0, transition:"background 0.25s" }}>
                  <div style={{ position:"absolute", top:3, left:opt.val?23:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s" }} />
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>{t('certifiedDocs')}</div>
            {[
              { label:t('idDocument'), status: verifyStatus==="verified"?t('verifiedCheck'):verifyStatus==="pending"?t('inProgressDots'):t('notVerifiedShort'), color: verifyStatus==="verified"?G.green:verifyStatus==="pending"?G.amber:G.coral },
              { label:t('firstAid'), status:t('toProvide'), color:G.muted },
              { label:t('criminalRecord'), status:t('toProvide'), color:G.muted },
            ].map(d => (
              <div key={d.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                <span style={{ color:G.text, fontSize:"0.85rem" }}>{d.label}</span>
                <span style={{ color:d.color, fontWeight:600, fontSize:"0.75rem" }}>{d.status}</span>
              </div>
            ))}
            <button onClick={() => setTab("identity")} style={{ marginTop:14, background:"none", border:"none", color:G.teal, fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>
              {t('verifyIdentity')}
            </button>
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('security')}</div>
            <div onClick={toggleTwoFA} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", cursor:"pointer" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:G.text, fontSize:"0.88rem" }}>{t('twoFactor')}</div>
                <div style={{ color:G.muted, fontSize:"0.75rem", marginTop:2 }}>{t('twoFactorDesc')}</div>
              </div>
              <div style={{ width:44, height:24, background:twoFAEnabled?G.teal:"rgba(255,255,255,0.15)", borderRadius:12, position:"relative", flexShrink:0, transition:"background 0.25s" }}>
                <div style={{ position:"absolute", top:3, left:twoFAEnabled?23:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s" }} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "availability" && <AvailabilityCalendar showToast={showToast} t={t} />}

      {/* ── TAB IDENTITÉ ── */}
      {tab === "identity" && (
        <div style={{ maxWidth:600 }}>
          {verifyStatus === "verified" && (
            <Card style={{ borderColor:G.green+"44", marginBottom:20, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>✅</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:"#fff", fontSize:"1.2rem", marginBottom:8 }}>{t('identity')} {t('verified')}</div>
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('verifiedByTeam')}</div>
            </Card>
          )}

          {verifyStatus === "pending" && (
            <Card style={{ borderColor:G.amber+"44", marginBottom:20, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⏳</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:"#fff", fontSize:"1.2rem", marginBottom:8 }}>{t('verifying')}</div>
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('teamVerifying')}</div>
            </Card>
          )}

          {verifyStatus === "unverified" && (
            <Card>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:8 }}>{t('identityVerification')}</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20, lineHeight:1.6 }}>
                {t('verificationConfidence')}
              </div>

              <div style={{ background:G.teal+"11", border:`1px solid ${G.teal}33`, borderRadius:10, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:"0.82rem", color:G.muted, lineHeight:1.8 }}>
                  {t('whatYouNeed')}<br/>
                  • {t('nationalIdCard')} <strong style={{color:G.text}}>{t('orWord')}</strong> {t('passportWord')}<br/>
                  • {t('dateOfBirthReq')}<br/>
                  • {t('infoMustMatch')}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>{t('documentType')}</label>
                <select value={docType} onChange={e=>setDocType(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                  <option value="carte_identite">🪪 {t('nationalIdCard')}</option>
                  <option value="passeport">📕 {t('passportWord')}</option>
                  <option value="titre_sejour">📄 {t('docResidencePermit')}</option>
                </select>
              </div>

              <div style={{ background:G.card, borderRadius:8, padding:"10px 12px", marginBottom:16, fontSize:"0.78rem", color:G.muted, lineHeight:1.6 }}>
                {docType==="carte_identite" && t('docInstructionsCNI')}
                {docType==="passeport" && t('docInstructionsPassport')}
                {docType==="titre_sejour" && t('docInstructionsResidence')}
              </div>

              <Input label={t('documentNumber')} value={docNumber} onChange={setDocNumber} placeholder="Ex: 123456789" icon="🔢" />
              <Input label={t('birthDate')} type="date" value={birthDate} onChange={setBirthDate} />

              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>
                  {t('photoOfYour')} {docType==="carte_identite"?t('fullCNI'):docType==="passeport"?t('fullPassport'):t('fullResidencePermit')}
                </label>
                <div style={{ border:`2px dashed ${G.border}`, borderRadius:12, padding:20, textAlign:"center", cursor:"pointer", background:"rgba(255,255,255,0.02)", position:"relative" }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleUploadId(e.dataTransfer.files[0]); }}>
                  <input type="file" accept="image/*" onChange={e => handleUploadId(e.target.files[0])} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer" }} />
                  {uploadedUrl ? (
                    <div>
                      <div style={{ fontSize:"2rem", marginBottom:8 }}>✅</div>
                      <div style={{ color:G.green, fontWeight:600, fontSize:"0.85rem" }}>{t('documentUploaded')}</div>
                      <div style={{ color:G.muted, fontSize:"0.72rem", marginTop:4 }}>{t('clickToChange')}</div>
                    </div>
                  ) : uploadingDoc ? (
                    <div>
                      <div style={{ fontSize:"1.5rem", marginBottom:8 }}>⏳</div>
                      <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('uploadingInProgress')}</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:"2.5rem", marginBottom:8, opacity:0.4 }}>{docType==="carte_identite"?"🪪":docType==="passeport"?"📕":"📄"}</div>
                      <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:4 }}>
                        {t('dragYourDocument')} {docType==="carte_identite"?t('docCNI'):docType==="passeport"?t('docPassport'):t('docResidencePermit')} {t('here')}
                      </div>
                      <div style={{ color:G.muted, fontSize:"0.72rem" }}>{t('dragDropOrClick')}</div>
                    </div>
                  )}
                </div>
                {uploadError && <div style={{ color:G.coral, fontSize:"0.78rem", marginTop:8 }}>⚠️ {uploadError}</div>}
              </div>

              <div style={{ background:"rgba(251,191,36,0.08)", border:`1px solid ${G.amber}33`, borderRadius:10, padding:12, marginBottom:20, fontSize:"0.78rem", color:G.muted, lineHeight:1.6 }}>
                🔒 <strong style={{color:G.text}}>{t('confidentialityLabel')}</strong> {t('confidentialityNote')}
              </div>

              <Btn onClick={handleVerifyIdentity} variant="teal" size="lg" full disabled={verifying}>
                {verifying ? t('sending') : t('submitVerification')}
              </Btn>
            </Card>
          )}

          <Card style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('howItWorks')}</div>
            {[
              ["1️⃣", t('step1Title'), t('step1Desc')],
              ["2️⃣", t('step2Title'), t('step2Desc')],
              ["3️⃣", t('step3Title'), t('step3Desc')],
            ].map(([num, title, desc]) => (
              <div key={title} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                <span style={{ fontSize:"1.2rem", flexShrink:0 }}>{num}</span>
                <div>
                  <div style={{ fontWeight:600, color:G.text, fontSize:"0.85rem" }}>{title}</div>
                  <div style={{ color:G.muted, fontSize:"0.78rem", marginTop:2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── TAB STATS ── */}
      {tab === "stats" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { icon:"✅", label:t('missionsCompleted'), val:my.length, color:G.green },
            { icon:"💰", label:t('totalEarned'), val:my.reduce((s,b)=>s+b.price,0)+"€", color:G.teal },
            { icon:"⭐", label:t('avgRating'), val:"4.9", color:G.amber },
            { icon:"👶", label:t('childrenCared'), val:my.reduce((s,b)=>s+(b.children||1),0), color:G.purple },
            { icon:"⏱", label:t('careHours'), val:my.reduce((s,b)=>s+parseInt(b.duration||0),0)+"h", color:G.coral },
            { icon:"📹", label:t('careWithCamera'), val:my.filter(b=>b.camera).length, color:G.teal },
          ].map(s => (
            <Card key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:s.color, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:"0.75rem", color:G.muted }}>{s.label}</div>
            </Card>
          ))}

          <Card style={{ gridColumn:"1 / -1" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('lastMissions')}</div>
            {my.length === 0 && <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('noMissionCompleted')}</div>}
            {my.slice(0,5).map(b => (
              <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                <span style={{ fontSize:"1.5rem" }}>👨‍👧</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:"0.85rem", color:G.text }}>{b.parentName}</div>
                  <div style={{ color:G.muted, fontSize:"0.75rem" }}>{b.date} · {b.duration} · {b.children} {b.children>1?t('childrenLabelPlural'):t('childrenLabel')}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal }}>{b.price}€</div>
                  {b.rating && <div style={{ color:G.amber, fontSize:"0.7rem" }}>{"⭐".repeat(b.rating)}</div>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── CAMERA PAGE ──────────────────────────────────────────────
const CameraPage = ({ user, t = (k) => k }) => {
  const [active, setActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [time, setTime] = useState("--:--:--");
  const videoRef = useRef();
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toTimeString().slice(0,8)), 1000);
    return () => clearInterval(iv);
  }, []);
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:{ width:1280, height:720 }, audio:false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setActive(true);
    } catch(e) { alert(t('cameraAccessDenied')); }
  };
  const stop = () => {
    if (stream) stream.getTracks().forEach(t=>t.stop());
    setStream(null); setActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
      <div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:4 }}>
          {user.role==="parent" ? t('liveSurveillance') : t('missionStream')}
        </div>
        <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:16 }}>{t('encryptedStream')}</div>
        <div style={{ background:"#000", borderRadius:16, overflow:"hidden", position:"relative", aspectRatio:"16/9", border:`1px solid ${G.border}`, marginBottom:14 }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:active?"block":"none", transform:"scaleX(-1)" }} />
          {!active && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:G.muted }}>
              <div style={{ fontSize:"3rem", opacity:0.25 }}>📷</div>
              <div style={{ fontSize:"0.88rem" }}>{t('clickToStart')}</div>
            </div>
          )}
          {active && (
            <>
              <div style={{ position:"absolute", top:0, left:0, right:0, padding:"12px 16px", background:"linear-gradient(180deg,rgba(0,0,0,0.75),transparent)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(239,68,68,0.9)", padding:"4px 10px", borderRadius:100, fontSize:"0.68rem", fontWeight:800, color:"#fff" }}>
                  <span style={{ animation:"bw-blink 1s step-end infinite", display:"inline-block", width:5, height:5, background:"#fff", borderRadius:"50%" }} />
                  LIVE
                </div>
                <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.78rem", fontWeight:600 }}>{time}</div>
              </div>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 16px 10px", background:"linear-gradient(0deg,rgba(0,0,0,0.7),transparent)", fontSize:"0.72rem", color:"rgba(255,255,255,0.6)" }}>
                {t('atClientHome')}
              </div>
            </>
          )}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {!active
            ? <Btn onClick={start} variant="teal" size="lg">{t('startStream')}</Btn>
            : <Btn onClick={stop} variant="coral" size="lg">{t('stopStream')}</Btn>
          }
          {active && <Btn onClick={() => { const c=document.createElement("canvas"); const v=videoRef.current; c.width=v.videoWidth||640; c.height=v.videoHeight||360; c.getContext("2d").drawImage(v,0,0); c.toBlob(b=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="bw-"+Date.now()+".png"; a.click(); }); }} variant="ghost" size="lg">{t('snapshot')}</Btn>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>{t('status')}</div>
          {[
            [t('cameraBadge'), active?t('statusActive'):t('statusInactive'), active?G.green:G.muted],
            [t('encryption'), "DTLS/SRTP", G.teal],
            [t('protocol'), "WebRTC P2P", G.teal],
            [t('storage'), t('none'), G.green],
          ].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.8rem" }}>
              <span style={{ color:G.muted }}>{l}</span>
              <span style={{ color:c, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:10 }}>{t('privacy')}</div>
          <div style={{ color:G.muted, fontSize:"0.78rem", lineHeight:1.7 }}>{t('p2pOnly')} <strong style={{ color:G.text }}>{t('noServerVideo')}</strong></div>
        </Card>
      </div>
    </div>
  );
};

// ─── MAP VIEW ─────────────────────────────────────────────────
const MapView = ({ user, showToast, t = (k) => k }) => {
  const [sitters, setSitters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLat, setUserLat] = useState(48.8566);
  const [userLng, setUserLng] = useState(2.3522);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxDist, setMaxDist] = useState(10);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const distance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };
  useEffect(() => {
    fetch(`${API}/profile/sitters/map`)
      .then(r => r.json())
      .then(data => { setSitters(Array.isArray(data)?data:[]); setLoading(false); })
      .catch(() => setLoading(false));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);
  useEffect(() => {
    if (loading || !mapRef.current) return;
    const initMap = () => {
      if (!window.L || !mapRef.current) return;
      if (mapInstance.current) { mapInstance.current.remove(); }
      const map = window.L.map(mapRef.current).setView([userLat, userLng], 13);
      mapInstance.current = map;
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(map);
      const userIcon = window.L.divIcon({ html:`<div style="background:#2dd4bf;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`, iconSize:[16,16], iconAnchor:[8,8], className:'' });
      window.L.marker([userLat, userLng], { icon:userIcon }).addTo(map).bindPopup('<strong>📍 Vous êtes ici</strong>');
      sitters.forEach(s => {
        if (!s.latitude || !s.longitude) return;
        const dist = distance(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude));
        const sitterIcon = window.L.divIcon({ html:`<div style="background:${s.verification_status==='verified'?'#fbbf24':'#a78bfa'};width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:1.2rem">👩</div>`, iconSize:[36,36], iconAnchor:[18,18], className:'' });
        window.L.marker([parseFloat(s.latitude), parseFloat(s.longitude)], { icon:sitterIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:Arial,sans-serif;min-width:180px"><strong>${s.first_name} ${s.last_name}</strong><br/><span style="color:#666;font-size:0.8rem">📍 ${s.city||'N/A'} · ${dist.toFixed(1)} km</span><br/><span style="font-size:0.8rem">⭐ ${s.rating||'—'} · ${s.hourly_rate||'—'}€/h</span>${s.verification_status==='verified'?'<br/><span style="color:#22c55e;font-size:0.75rem">✅ Identité vérifiée</span>':''}</div>`)
          .on('click', () => setSelected({ ...s, dist:dist.toFixed(1) }));
      });
    };
    if (!window.L) {
      const link = document.createElement('link'); link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
      const script = document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload=()=>initMap(); document.head.appendChild(script);
    } else { initMap(); }
  }, [loading, userLat, userLng, sitters]);
  const filteredSitters = sitters
    .filter(s => s.latitude && s.longitude)
    .map(s => ({ ...s, dist:distance(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude)) }))
    .filter(s => s.dist <= maxDist)
    .filter(s => !search || s.first_name?.toLowerCase().includes(search.toLowerCase()) || s.last_name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => a.dist - b.dist);
  return (
    <div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:4 }}>🗺️ Babysitters près de chez vous</div>
      <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:16 }}>{t('nearbySubtitle')}</div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un babysitter…" style={{ flex:1, minWidth:200, background:G.card, border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 16px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border}`, borderRadius:10, padding:"0 14px" }}>
          <span style={{ color:G.muted, fontSize:"0.78rem" }}>{t('radius')}</span>
          <select value={maxDist} onChange={e=>setMaxDist(parseInt(e.target.value))} style={{ background:"transparent", border:"none", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", padding:"10px 4px" }}>
            {[2,5,10,20,50].map(d => <option key={d} value={d}>{d} km</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>
        <div ref={mapRef} style={{ height:500, borderRadius:16, overflow:"hidden", border:`1px solid ${G.border}`, background:G.card }} />
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {selected && (
            <Card style={{ borderColor:G.teal+"44" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <span style={{ fontSize:"2rem" }}>👩</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {selected.city} · {selected.dist} km de vous</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:G.muted, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                <div style={{ background:G.night, borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal }}>{selected.hourly_rate}€/h</div>
                  <div style={{ fontSize:"0.65rem", color:G.muted }}>{t('price')}</div>
                </div>
                <div style={{ background:G.night, borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.amber }}>⭐ {selected.rating||"—"}</div>
                  <div style={{ fontSize:"0.65rem", color:G.muted }}>{t('rating')}</div>
                </div>
              </div>
              {selected.bio && <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:12, lineHeight:1.5 }}>{selected.bio}</div>}
              {selected.verification_status==="verified" && <Badge color={G.green} style={{marginBottom:10}}>✅ Identité vérifiée</Badge>}
            </Card>
          )}
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"0.9rem" }}>
            {filteredSitters.length} babysitter{filteredSitters.length>1?"s":""} à moins de {maxDist} km
          </div>
          {filteredSitters.length===0 && !loading && (
            <Card style={{ textAlign:"center", padding:20 }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>😔</div>
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>{t('noSitterRadius')}</div>
              <button onClick={()=>setMaxDist(50)} style={{ marginTop:10, background:"none", border:"none", color:G.teal, cursor:"pointer", fontSize:"0.82rem", fontWeight:600 }}>Élargir à 50 km →</button>
            </Card>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:340, overflowY:"auto" }}>
            {filteredSitters.map(s => (
              <Card key={s.id} onClick={() => setSelected(s)} style={{ cursor:"pointer", borderColor:selected?.id===s.id?G.teal+"44":"transparent", padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"1.5rem" }}>👩</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:"0.88rem" }}>{s.first_name} {s.last_name}</div>
                    <div style={{ color:G.muted, fontSize:"0.72rem" }}>📍 {s.dist.toFixed(1)} km · ⭐ {s.rating||"—"} · {s.hourly_rate}€/h</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
  {s.verification_status==="verified" && <span style={{ fontSize:"0.7rem", color:G.green }}>✅</span>}
  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{ background:"none", border:"none", fontSize:"1rem", cursor:"pointer", padding:2 }}>
    {favorites.includes(s.id) ? "❤️" : "🤍"}
  </button>
</div>
                  {s.verification_status==="verified" && <span style={{ fontSize:"0.7rem", color:G.green }}>✅</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
const AdminDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState("verifications");
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, showToast] = useToast();

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers }).then(r=>r.json()).then(setStats);
    fetch(`${API}/admin/verifications`, { headers }).then(r=>r.json()).then(setVerifications);
    fetch(`${API}/admin/users`, { headers }).then(r=>r.json()).then(setUsers);
    fetch(`${API}/admin/bookings`, { headers }).then(r=>r.json()).then(data => setBookings(Array.isArray(data) ? data : []));
  }, []);

  const approve = async (userId) => {
    const res = await fetch(`${API}/admin/verify/${userId}/approve`, { method:'POST', headers });
    const data = await res.json();
    if (res.ok) {
      showToast("✅ " + data.message, "ok");
      setVerifications(prev => prev.map(v => v.id===userId ? {...v, verification_status:"verified"} : v));
    } else showToast("❌ " + data.error, "err");
  };

  const reject = async () => {
    if (!rejectReason.trim()) { showToast("⚠️ Entrez une raison.", "err"); return; }
    const res = await fetch(`${API}/admin/verify/${rejectModal}/reject`, { method:'POST', headers, body: JSON.stringify({ reason: rejectReason }) });
    const data = await res.json();
    if (res.ok) {
      showToast("❌ " + data.message, "ok");
      setVerifications(prev => prev.map(v => v.id===rejectModal ? {...v, verification_status:"rejected"} : v));
      setRejectModal(null); setRejectReason("");
    } else showToast("❌ " + data.error, "err");
  };

  const verifBadge = (status) => {
    if (status === "verified") return <Badge color={G.green}>✅ Vérifié</Badge>;
    if (status === "pending")  return <Badge color={G.amber}>⏳ En attente</Badge>;
    if (status === "rejected") return <Badge color={G.coral}>❌ Rejeté</Badge>;
    return <Badge color={G.muted}>— Non soumis</Badge>;
  };

  return (
    <div style={{ minHeight:"100vh", background:G.night }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{font-family:'Inter',sans-serif;background:#0f1923;color:#e2e8f0} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} select option{background:#162030}`}</style>

      {/* Nav Admin */}
      <nav style={{ background:G.panel, borderBottom:`1px solid ${G.border}`, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.25rem", color:"#fff" }}>
          🍼 Baby<span style={{ color:G.coral }}>Watch</span>
          <span style={{ marginLeft:10, background:G.coral+"22", color:G.coral, fontSize:"0.7rem", padding:"2px 10px", borderRadius:100, fontFamily:"'Inter',sans-serif", fontWeight:700 }}>⚡ ADMIN</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[["verifications","🪪 Vérifications"],["users","👥 Utilisateurs"],["bookings","📋 Réservations"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding:"7px 14px", borderRadius:8, border:"none", background:tab===id?G.coral+"22":"transparent", color:tab===id?G.coral:G.muted, fontFamily:"'Inter',sans-serif", fontWeight:tab===id?600:400, fontSize:"0.85rem", cursor:"pointer" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:G.muted, fontSize:"0.82rem" }}>👤 {user.name}</span>
          <button onClick={onLogout} style={{ background:"rgba(255,95,87,0.12)", border:"1px solid rgba(255,95,87,0.25)", color:G.coral, padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
            {[
              { icon:"👥", label:"Utilisateurs", val:stats.totalUsers, color:G.teal },
              { icon:"👩", label:"Babysitters", val:stats.totalSitters, color:G.amber },
              { icon:"📋", label:"Réservations", val:stats.totalBookings, color:G.purple },
              { icon:"⏳", label:"Vérifications en attente", val:stats.pendingVerif, color:G.coral },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:"1.8rem" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.6rem", color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:"0.72rem", color:G.muted }}>{s.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── TAB VÉRIFICATIONS ── */}
        {tab === "verifications" && (
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:16 }}>
              🪪 Vérifications d'identité
            </div>
            {verifications.length === 0 && (
              <Card style={{ textAlign:"center", padding:40 }}>
                <div style={{ fontSize:"2.5rem", marginBottom:12 }}>✅</div>
                <div style={{ color:G.muted }}>Aucune vérification en attente.</div>
              </Card>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {verifications.map(v => (
                <Card key={v.id}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>

                    {/* Photo du document */}
                    {v.id_document_url ? (
                      <a href={v.id_document_url} target="_blank" rel="noreferrer">
                        <img src={v.id_document_url} alt="Document" style={{ width:120, height:80, objectFit:"cover", borderRadius:8, border:`1px solid ${G.border}`, flexShrink:0 }} />
                      </a>
                    ) : (
                      <div style={{ width:120, height:80, background:G.night, borderRadius:8, border:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ color:G.muted, fontSize:"0.72rem", textAlign:"center" }}>Pas de<br/>document</span>
                      </div>
                    )}

                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"1rem" }}>{v.first_name} {v.last_name}</span>
                        {verifBadge(v.verification_status)}
                      </div>
                      <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:4 }}>✉️ {v.email}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,auto)", gap:"4px 16px", fontSize:"0.78rem", color:G.muted }}>
                        <span>📄 {v.id_document_type?.replace("_"," ") || "—"}</span>
                        <span>⭐ {v.rating || "—"}</span>
                        <span>✅ {v.total_missions || 0} missions</span>
                        <span>📅 Soumis le {v.verification_submitted_at ? new Date(v.verification_submitted_at).toLocaleDateString('fr-FR') : "—"}</span>
                        <span>🗓 Inscrit le {new Date(v.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {v.verification_status === "pending" && (
                      <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
                        <Btn onClick={() => approve(v.id)} variant="teal" size="sm">✅ Approuver</Btn>
                        <Btn onClick={() => setRejectModal(v.id)} variant="danger" size="sm">❌ Rejeter</Btn>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB UTILISATEURS ── */}
        {tab === "users" && (
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:16 }}>
              👥 Tous les utilisateurs
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {users.map(u => (
                <Card key={u.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <span style={{ fontSize:"1.8rem" }}>{u.role === "parent" ? "👨‍👧" : "👩"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{u.first_name} {u.last_name}</span>
                        <Badge color={u.role==="parent"?G.teal:G.amber}>{u.role}</Badge>
                        {u.verified ? <Badge color={G.green}>✅ Email vérifié</Badge> : <Badge color={G.coral}>❌ Non vérifié</Badge>}
                        {u.role==="sitter" && verifBadge(u.verification_status)}
                      </div>
                      <div style={{ color:G.muted, fontSize:"0.78rem" }}>✉️ {u.email} · 🗓 {new Date(u.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    {u.role === "sitter" && (
                      <div style={{ textAlign:"right", fontSize:"0.78rem", color:G.muted }}>
                        <div>⭐ {u.rating || "—"}</div>
                        <div>{u.total_missions || 0} missions</div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB RÉSERVATIONS ── */}
        {tab === "bookings" && (
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:16 }}>
              📋 Toutes les réservations
            </div>
            {bookings.length === 0 && (
              <Card style={{ textAlign:"center", padding:40 }}>
                <div style={{ color:G.muted }}>Aucune réservation pour le moment.</div>
              </Card>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {bookings.map(b => (
                <Card key={b.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{b.parent_name}</span>
                        <span style={{ color:G.muted }}>→</span>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, color:G.teal }}>{b.sitter_name}</span>
                        <StatusBadge status={b.status} />
                        {b.camera && <Badge color={G.teal}>📹 Caméra</Badge>}
                      </div>
                      <div style={{ color:G.muted, fontSize:"0.78rem" }}>
                        📅 {b.date} à {b.time_start} · ⏱ {b.duration}h · 👶 {b.children} enfant{b.children>1?"s":""} · 📍 {b.address}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.1rem" }}>{b.price}€</div>
                      {b.rating && <div style={{ color:G.amber, fontSize:"0.75rem" }}>{"⭐".repeat(b.rating)}</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal rejet */}
      {rejectModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <Card style={{ maxWidth:440, width:"100%" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:"#fff", fontSize:"1.1rem", marginBottom:16 }}>❌ Raison du rejet</div>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Ex: Document illisible, photo floue, document expiré…" style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:80, marginBottom:16 }} />
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={() => { setRejectModal(null); setRejectReason(""); }} variant="ghost" full>Annuler</Btn>
              <Btn onClick={reject} variant="danger" full>❌ Confirmer le rejet</Btn>
            </div>
          </Card>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
};

// ─── PAYMENT MODAL ────────────────────────────────────────────
const PaymentModal = ({ booking, onClose, onSuccess, showToast, t = (k) => k }) => {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  // NOTE: la saisie de carte a ete retiree volontairement.
  // Collecter un numero de carte dans un <input> classique viole la norme PCI-DSS.
  // L'integration reelle doit passer par Stripe Elements (voir StripePayment.jsx).
  const handlePayment = async () => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: booking.price, bookingId: booking.id, sitterName: booking.sitterName })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t('connectionError')); setLoading(false); return; }
      setPaid(true);
      setLoading(false);
    } catch(e) { setError(t('connectionError')); setLoading(false); }
  };

  if (paid) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ maxWidth:420, width:"100%", textAlign:"center", padding:40 }}>
        <div style={{ fontSize:"3.5rem", marginBottom:16 }}>✅</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:12 }}>{t('bookingRegistered')}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:16 }}>{t('paymentPendingNote')}</div>
        <div style={{ color:G.teal, fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", marginBottom:24 }}>{booking.price}€</div>
        <Btn onClick={() => { onSuccess(); onClose(); }} variant="teal" size="lg" full>{t('viewBooking')}</Btn>
      </Card>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>
        <div style={{ background:G.night, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.2rem", color:"#fff" }}>{t('confirmBooking')}</div>
            <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:4 }}>{booking.sitterName} · {booking.date}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:G.muted, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
        </div>

        <div style={{ padding:"28px" }}>
          <div style={{ background:G.card, borderRadius:12, padding:16, marginBottom:20, border:`1px solid ${G.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ color:G.muted, fontSize:"0.85rem" }}>{booking.duration} · {booking.children} {booking.children>1?t('childrenLabelPlural'):t('childrenLabel')}</span>
              <span style={{ color:G.text, fontWeight:600 }}>{booking.price}€</span>
            </div>
            {booking.camera && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:G.muted, fontSize:"0.85rem" }}>{t('cameraOption')}</span>
                <span style={{ color:G.teal, fontWeight:600 }}>{t('included')}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${G.border}`, paddingTop:10, marginTop:8 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{t('total')}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.3rem" }}>{booking.price}€</span>
            </div>
          </div>

          <div style={{ background:"rgba(251,191,36,0.08)", border:`1px solid ${G.amber}44`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ color:G.amber, fontWeight:700, fontSize:"0.85rem", marginBottom:6 }}>{t('demoModeTitle')}</div>
            <div style={{ color:G.muted, fontSize:"0.78rem", lineHeight:1.6 }}>{t('demoModeNote')}</div>
          </div>

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={onClose} variant="ghost" full>{t('cancel')}</Btn>
            <Btn onClick={handlePayment} variant="teal" full disabled={loading}>
              {loading ? t('processing') : t('confirmBookingBtn')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CHAT MODAL ───────────────────────────────────────────────
const ChatModal = ({ booking, user, onClose, t = (k) => k }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const receiverId = user.role === 'parent' ? booking.sitterId : booking.parentId;

  useEffect(() => {
    fetch(`${API}/chat/${booking.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
    .catch(() => setLoading(false));
  }, [booking.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const tempMsg = {
      id: Date.now(),
      content: newMsg,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      created_at: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMsg("");
    try {
      const res = await fetch(`${API}/chat/${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMsg, receiverId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      }
    } catch(e) { console.error(e); }
  };

  const isMe = (msg) => msg.sender_id === user.id || msg.sender_id === parseInt(user.id);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:500, height:"80vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>

        {/* Header */}
        <div style={{ background:G.night, padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:"1.8rem" }}>{user.role==="parent" ? booking.sitterAvatar || "👩" : "👨‍👧"}</span>
            <div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", fontSize:"0.95rem" }}>
                {user.role==="parent" ? booking.sitterName : booking.parentName}
              </div>
              <div style={{ color:G.green, fontSize:"0.72rem", display:"flex", alignItems:"center", gap:4 }}>
                <Dot color={G.green} pulse /> En ligne
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:G.muted, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
        </div>

        {/* Info réservation */}
        <div style={{ background:G.card, padding:"10px 24px", borderBottom:`1px solid ${G.border}`, fontSize:"0.75rem", color:G.muted, flexShrink:0 }}>
          📅 {booking.date} à {booking.time} · ⏱ {booking.duration} · 📍 {booking.address}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:8 }}>
          {loading && <div style={{ textAlign:"center", color:G.muted, padding:20 }}>{t('loading')}</div>}
          {!loading && messages.length===0 && (
            <div style={{ textAlign:"center", color:G.muted, padding:40 }}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>💬</div>
              <div style={{ fontSize:"0.88rem" }}>{t('startConversation')}</div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems:isMe(msg)?"flex-end":"flex-start" }}>
              <div style={{
                maxWidth:"75%",
                background: isMe(msg) ? G.teal : G.card,
                color: isMe(msg) ? "#0f1923" : G.text,
                padding:"10px 14px",
                borderRadius: isMe(msg) ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                fontSize:"0.88rem",
                lineHeight:1.5,
                opacity: msg.pending ? 0.7 : 1,
                border: isMe(msg) ? "none" : `1px solid ${G.border}`,
              }}>
                {msg.content}
              </div>
              <div style={{ fontSize:"0.65rem", color:G.muted, marginTop:3, paddingLeft:4, paddingRight:4 }}>
                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                {msg.pending && " · Envoi…"}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${G.border}`, display:"flex", gap:10, flexShrink:0 }}>
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyPress={e => e.key==="Enter" && sendMessage()}
            placeholder="Écrire un message…"
            style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:12, padding:"10px 16px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}
          />
          <button onClick={sendMessage} disabled={!newMsg.trim()} style={{ background:G.teal, border:"none", borderRadius:12, width:44, height:44, cursor:newMsg.trim()?"pointer":"not-allowed", opacity:newMsg.trim()?1:0.4, fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [page, setPage] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [toast, showToast] = useToast();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const t = useTranslation(lang);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  useEffect(() => {
    const initPush = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.requestPermissions();
        await PushNotifications.register();
        PushNotifications.addListener('registration', token => {
          const authToken = localStorage.getItem('token');
          if (authToken) {
            fetch(`${API}/notifications/register-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
              body: JSON.stringify({ pushToken: token.value })
            }).catch(console.error);
          }
        });
        PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Notification reçue:', notification);
        });
      } catch(e) {
        console.log('Push non disponible sur web');
      }
    };
    if (user) initPush();
  }, [user]);

  // Restaure la session au chargement (évite la déconnexion à chaque F5)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)); }
      catch(e) { localStorage.removeItem('user'); }
    }
    setSessionChecked(true);
  }, []);

  // Charge les vraies réservations depuis l'API
  useEffect(() => {
    if (!user) { setBookings([]); return; }
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/bookings`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setBookings(data.map(b => ({
          id: b.id,
          parentId: b.parent_id,
          sitterId: b.sitter_id,
          parentName: b.parent_name || "",
          sitterName: b.sitter_name || "",
          sitterAvatar: "👩",
          date: b.date ? String(b.date).slice(0,10) : "",
          time: b.time_start ? String(b.time_start).slice(0,5) : "",
          duration: b.duration ? `${b.duration}h` : "",
          address: b.address || "",
          children: b.children || 1,
          notes: b.notes || "",
          camera: !!b.camera,
          status: b.status || "pending",
          price: b.price ? parseFloat(b.price) : 0,
          rating: b.rating || null,
          review: b.review || "",
        })));
      })
      .catch(console.error);
  }, [user]);

  const handleLogin  = (u) => {
    setUser(u);
    try { localStorage.setItem('user', JSON.stringify(u)); } catch(e) {}
    setPage("home");
    window.history.pushState({}, "", "/");
  };
  const handleLogout = ()  => {
    setUser(null);
    setPage("home");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isConfirmPage = window.location.pathname === "/confirm" || (window.location.search.includes("token=") && !window.location.pathname.includes("reset"));
  const isResetPage   = window.location.pathname === "/reset-password" || (window.location.search.includes("token=") && window.location.pathname.includes("reset"));

  if (isConfirmPage) return (
    <>
      <style>{`@keyframes bw-blink{50%{opacity:0}} *{box-sizing:border-box} body{background:#0f1923}`}</style>
      <ConfirmPage onLogin={handleLogin} t={t} />
    </>
  );

  if (isResetPage) return (
    <>
      <style>{`*{box-sizing:border-box} body{background:#0f1923}`}</style>
      <ResetPasswordPage onBack={() => window.location.href = "/"} t={t} />
    </>
  );

  if (user?.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;

  const addBooking     = (b)  => setBookings(prev => [{ ...b, parentId:user.id, parentName:user.name }, ...prev]);
  const cancelBooking  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Réservation annulée.", "err"); };
  const acceptMission  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"confirmed"} : b)); showToast("✅ Mission acceptée !", "ok"); };
  const declineMission = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Mission refusée.", "err"); };
  const addReview      = (id, rating, review) => { setBookings(prev => prev.map(b => b.id===id?{...b,rating,review}:b)); showToast("⭐ Avis publié avec succès !", "ok"); };

  // Évite le clignotement de l'écran de connexion pendant la vérification
  if (!sessionChecked) return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:"2.5rem" }}>🍼</div>
    </div>
  );

  if (!user) return (
    <>
      <style>{`
        @keyframes bw-blink{50%{opacity:0}}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
      `}</style>
      {showAuth
        ? <AuthPage onLogin={handleLogin} t={t} onBackToLanding={() => setShowAuth(false)} />
        : <LandingPage onStart={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} lang={lang} onLangChange={changeLang} t={t} />}
      <Toast toast={toast} />
    </>
  );

  const isParent = user.role === "parent";

 const renderPage = () => {
  if (page==="home")     return isParent ? <ParentHome user={user} bookings={bookings} onNav={setPage} t={t}/> : <SitterHome user={user} bookings={bookings} onNav={setPage} t={t}/>;
  if (page==="search")   return <SearchSitters onBook={addBooking} showToast={showToast} t={t}/>;
  if (page==="map")      return <MapView user={user} showToast={showToast} t={t}/>;
  if (page==="bookings") return <ParentBookings user={user} bookings={bookings} onCancel={cancelBooking} onNav={setPage} onReview={addReview} t={t}/>;
  if (page==="profile")  return isParent ? <ParentProfile user={user} showToast={showToast} t={t}/> : <SitterProfile user={user} bookings={bookings} showToast={showToast} t={t}/>;
  if (page==="missions") return <SitterMissions user={user} bookings={bookings} onAccept={acceptMission} onDecline={declineMission} t={t}/>;
  if (page==="camera")   return <CameraPage user={user} t={t}/>;
if (page==="children") return <ChildrenManager showToast={showToast} t={t}/>;
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;background:#0f1923;color:#e2e8f0;direction:${lang==='ar'?'rtl':'ltr'};text-align:${lang==='ar'?'right':'left'}}
        input,select,textarea{color:#e2e8f0!important}
        input:focus,select:focus,textarea:focus{border-color:#2dd4bf!important;outline:none!important}
        @keyframes bw-blink{50%{opacity:0}}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        select option{background:#162030}
      `}</style>
      <ErrorBoundary>
        <Nav user={user} activePage={page} onNav={setPage} onLogout={handleLogout} lang={lang} onLangChange={changeLang}/>
        <main style={{ paddingTop:64, minHeight:"100vh" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
            {renderPage()}
          </div>
        </main>
      </ErrorBoundary>
      <Toast toast={toast}/>
    </>
  );
}