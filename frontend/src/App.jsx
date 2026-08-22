import { useState, useEffect, useRef } from "react";
// v2.1 - fix sitter profile
const API = 'https://babywatch-production.up.railway.app/api';
import { translations, useTranslation } from './translations.js';

const USERS = {
  "parent@demo.fr":   { password: "demo123", role: "parent",   name: "Sophie Dupont",    avatar: "👩‍👧", id: "P001" },
  "sitter@demo.fr":   { password: "demo123", role: "sitter",   name: "Camille Bertrand", avatar: "👩", id: "S001" },
  "parent2@demo.fr":  { password: "demo123", role: "parent",   name: "Marc Lefevre",     avatar: "👨‍👦", id: "P002" },
  "sitter2@demo.fr":  { password: "demo123", role: "sitter",   name: "Lucas Martin",     avatar: "👨", id: "S002" },
};

const BOOKINGS_INIT = [
  { id: "BK001", parentId: "P001", sitterId: "S001", parentName: "Sophie Dupont", sitterName: "Camille Bertrand", sitterAvatar: "👩", date: "2026-06-18", time: "18:30", duration: "3h", status: "confirmed", camera: true,  address: "12 rue de la Paix, Paris 75001", children: 1, notes: "Emma, 8 mois. Biberon à 19h.", price: 42, createdAt: "2026-06-10" },
  { id: "BK002", parentId: "P001", sitterId: "S002", parentName: "Sophie Dupont", sitterName: "Lucas Martin",    sitterAvatar: "👨", date: "2026-06-25", time: "19:00", duration: "4h", status: "pending",   camera: true,  address: "12 rue de la Paix, Paris 75001", children: 2, notes: "Tom (3 ans) et Léa (6 ans).", price: 52, createdAt: "2026-06-14" },
  { id: "BK003", parentId: "P001", sitterId: "S001", parentName: "Sophie Dupont", sitterName: "Camille Bertrand", sitterAvatar: "👩", date: "2026-05-30", time: "20:00", duration: "3h", status: "completed", camera: false, address: "12 rue de la Paix, Paris 75001", children: 1, notes: "", price: 36, createdAt: "2026-05-25", rating: 5 },
  { id: "BK004", parentId: "P001", sitterId: "S001", parentName: "Sophie Dupont", sitterName: "Camille Bertrand", sitterAvatar: "👩", date: "2026-05-10", time: "18:00", duration: "2h", status: "completed", camera: true,  address: "12 rue de la Paix, Paris 75001", children: 1, notes: "", price: 28, createdAt: "2026-05-05", rating: 5 },
  { id: "BK005", parentId: "P002", sitterId: "S001", parentName: "Marc Lefevre",  sitterName: "Camille Bertrand", sitterAvatar: "👩", date: "2026-06-20", time: "17:30", duration: "5h", status: "confirmed", camera: true,  address: "8 avenue Foch, Paris 75016",    children: 3, notes: "Jumeaux de 2 ans + aîné de 7 ans.", price: 70, createdAt: "2026-06-12" },
  { id: "BK006", parentId: "P002", sitterId: "S002", parentName: "Marc Lefevre",  sitterName: "Lucas Martin",    sitterAvatar: "👨", date: "2026-06-16", time: "14:00", duration: "3h", status: "pending",   camera: false, address: "8 avenue Foch, Paris 75016",    children: 1, notes: "", price: 33, createdAt: "2026-06-15" },
];

const SITTERS_LIST = [
  { id: "S001", name: "Camille Bertrand", avatar: "👩",   age: 26, city: "Paris 11e", rating: 4.9,  missions: 127, price: 12, tags: ["Nourrissons", "Premiers secours", "Anglais"],              camera: true,  available: true,  bio: "Diplômée en éducation de la petite enfance, j'adore créer un environnement chaleureux et stimulant." },
  { id: "S002", name: "Lucas Martin",    avatar: "👨",   age: 23, city: "Paris 15e", rating: 4.8,  missions: 89,  price: 11, tags: ["Activités créatives", "Devoirs", "Sport"],                  camera: true,  available: true,  bio: "Étudiant en STAPS, dynamique et créatif, j'aime proposer des activités sportives adaptées." },
  { id: "S003", name: "Sofia Ramirez",   avatar: "👩",   age: 30, city: "Paris 7e",  rating: 5.0,  missions: 213, price: 14, tags: ["Éducatrice spécialisée", "Espagnol", "Multiples enfants"], camera: true,  available: true,  bio: "Éducatrice spécialisée depuis 6 ans, je m'adapte à chaque enfant avec patience et bienveillance." },
  { id: "S004", name: "Emma Dubois",     avatar: "👧",   age: 21, city: "Paris 18e", rating: 4.7,  missions: 54,  price: 10, tags: ["Musicothérapie", "Lecture"],                                camera: false, available: false, bio: "Passionnée de musique et de littérature jeunesse, je rends chaque soir magique." },
  { id: "S005", name: "Nadia Khoury",    avatar: "👩",   age: 35, city: "Vincennes", rating: 4.95, missions: 301, price: 16, tags: ["Infirmière", "Besoins spéciaux", "Arabe"],                  camera: true,  available: true,  bio: "Infirmière de formation, je gère avec soin les enfants aux besoins particuliers ou médicaux." },
];

const G = {
  night: "#0f1923", panel: "#162030", card: "#1e2d40",
  border: "rgba(255,255,255,0.08)", coral: "#ff5f57",
  teal: "#2dd4bf", green: "#4ade80", amber: "#fbbf24",
  purple: "#a78bfa", text: "#e2e8f0", muted: "#64748b",
  cream: "#f0f4ff", navH: 64,
};

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
const ConfirmPage = ({ onLogin }) => {
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
const ForgotPasswordPage = ({ onBack }) => {
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
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>Entrez votre email pour recevoir un lien de réinitialisation.</div>
              <Input label="Adresse email" type="email" value={email} onChange={setEmail} placeholder="vous@email.fr" icon="✉️" />
              {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}
              <Btn onClick={handleSubmit} variant="teal" size="lg" full>Envoyer le lien →</Btn>
              <button onClick={onBack} style={{ marginTop:14, width:"100%", background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>← Retour à la connexion</button>
            </>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>📧</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:12 }}>Email envoyé !</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.</div>
              <Btn onClick={onBack} variant="ghost" full>← Retour à la connexion</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RESET PASSWORD PAGE ──────────────────────────────────────
const ResetPasswordPage = ({ onBack }) => {
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
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>Choisissez un nouveau mot de passe sécurisé.</div>
              <Input label="Nouveau mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" />
              <Input label="Confirmer le mot de passe" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" icon="🔒" />
              {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}
              <Btn onClick={handleSubmit} variant="teal" size="lg" full>Réinitialiser →</Btn>
            </>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>✅</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", color:"#fff", marginBottom:12 }}>Mot de passe mis à jour !</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20 }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</div>
              <Btn onClick={() => { window.history.pushState({}, "", "/"); onBack(); }} variant="teal" full>Se connecter →</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AUTH PAGE ────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch(e) {
      setError("Erreur de connexion au serveur.");
    }
  };

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

  const demoLogin = (em) => { const user = USERS[em]; onLogin({ ...user, email: em }); };

  if (mode === "forgot") return <ForgotPasswordPage onBack={() => setMode("login")} />;

  if (mode === "success") return (
    <div style={{ minHeight:"100vh", background:G.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:420, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>📧</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff", marginBottom:12 }}>Vérifiez votre email !</div>
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
        <div style={{ color:G.muted, fontSize:"0.85rem", marginTop:4 }}>La garde d'enfants en toute confiance</div>
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

          {mode === "register" && <Input label="Prénom & Nom" value={name} onChange={setName} placeholder="Sophie Dupont" icon="👤" />}
          <Input label="Adresse email" type="email" value={email} onChange={setEmail} placeholder="vous@email.fr" icon="✉️" />
          <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" />

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          {mode === "login"
            ? <Btn onClick={handleLogin} variant="teal" size="lg" full>Se connecter →</Btn>
            : <Btn onClick={handleRegister} variant={role==="sitter"?"amber":"teal"} size="lg" full>Créer mon compte →</Btn>
          }

          {mode === "login" && (
            <button onClick={() => setMode("forgot")} style={{ marginTop:12, width:"100%", background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'Inter',sans-serif", textDecoration:"underline" }}>
              Mot de passe oublié ?
            </button>
          )}

          {mode === "login" && (
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${G.border}` }}>
              <div style={{ color:G.muted, fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Comptes démo</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <button onClick={() => demoLogin("parent@demo.fr")} style={{ padding:"10px 12px", borderRadius:10, border:`1px solid ${G.teal}44`, background:G.teal+"11", color:G.teal, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer", textAlign:"center" }}>
                  👨‍👧 Parent<br /><span style={{ fontSize:"0.68rem", opacity:0.7 }}>Sophie Dupont</span>
                </button>
                <button onClick={() => demoLogin("sitter@demo.fr")} style={{ padding:"10px 12px", borderRadius:10, border:`1px solid ${G.amber}44`, background:G.amber+"11", color:G.amber, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer", textAlign:"center" }}>
                  👩 Babysitter<br /><span style={{ fontSize:"0.68rem", opacity:0.7 }}>Camille Bertrand</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ color:G.muted, fontSize:"0.72rem", marginTop:20 }}>🔒 Connexion sécurisée · RGPD</div>
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────
const Nav = ({ user, activePage, onNav, onLogout, lang, onLangChange  }) => {
  const isParent = user.role === "parent";
  const navItems = isParent
  ? [
    
      { id:"home",     label:"Accueil",     icon:"🏠" },
      { id:"missions", label:"Mes missions", icon:"📋" },
      { id:"profile",  label:"Mon profil",   icon:"👤" },
      { id:"camera",   label:"Flux caméra",  icon:"📹" },
     { id:"search",  label:"Babysitters", icon:"🔍" },
      { id:"map",     label:"Carte",       icon:"🗺️" },
      { id:"bookings",label:"Mes gardes",  icon:"📋" },
      { id:"camera",  label:"Caméra live", icon:"📹" },
    ]
  : [
    ];
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
            <div style={{ fontSize:"0.78rem", fontWeight:600, color:G.text }}>{user.name.split(" ")[0]}</div>
            <div style={{ fontSize:"0.65rem", color:G.muted }}>{user.email}</div>
          </div>
        </div>
        <select
  value={lang}
  onChange={e => onLangChange(e.target.value)}
  style={{ background:G.card, border:`1px solid ${G.border}`, color:G.text, borderRadius:8, padding:"6px 10px", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", cursor:"pointer", outline:"none" }}
>
  <option value="fr">🇫🇷 FR</option>
  <option value="en">🇬🇧 EN</option>
  <option value="ar">🇸🇦 AR</option>
</select>
        <button onClick={onLogout} style={{ background:"rgba(255,95,87,0.12)", border:"1px solid rgba(255,95,87,0.25)", color:G.coral, padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>Déconnexion</button>
      </div>
    </nav>
  );
};

// ─── PARENT HOME ──────────────────────────────────────────────
const ParentHome = ({ user, bookings, onNav }) => {
  const myBookings = bookings.filter(b => b.parentId === user.id);
  const upcoming = myBookings.filter(b => b.status==="confirmed"||b.status==="pending");
  const next = upcoming[0];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"linear-gradient(135deg,#1a2d45,#0f1f35)", borderRadius:18, padding:"32px 28px", border:`1px solid ${G.border}` }}>
        <div style={{ fontSize:"0.78rem", fontWeight:700, color:G.teal, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Bonjour 👋</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:"#fff", marginBottom:6 }}>{user.name}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:20 }}>Votre espace parent BabyWatch — gérez vos gardes et surveillez en direct.</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={() => onNav("search")} variant="teal">🔍 Trouver un babysitter</Btn>
          <Btn onClick={() => onNav("camera")} variant="ghost">📹 Caméra live</Btn>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Gardes à venir",     val:upcoming.length,                                    icon:"📅", color:G.teal   },
          { label:"En attente",         val:myBookings.filter(b=>b.status==="pending").length,   icon:"⏳", color:G.amber  },
          { label:"Gardes effectuées",  val:myBookings.filter(b=>b.status==="completed").length, icon:"✅", color:G.green  },
          { label:"Babysitters favoris",val:2,                                                   icon:"⭐", color:G.purple },
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
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>Prochaine garde</div>
            <StatusBadge status={next.status} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:"2.5rem" }}>{next.sitterAvatar}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"#fff", marginBottom:3 }}>{next.sitterName}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📅 {next.date} à {next.time} · ⏱ {next.duration} · 👶 {next.children} enfant{next.children>1?"s":""}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:2 }}>📍 {next.address}</div>
            </div>
            {next.camera && <Btn onClick={() => onNav("camera")} variant="teal" size="sm">📹 Live</Btn>}
          </div>
        </Card>
      )}
      <Card>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Historique récent</div>
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
        <button onClick={() => onNav("bookings")} style={{ marginTop:12, background:"none", border:"none", color:G.teal, fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>Voir tout →</button>
      </Card>
    </div>
  );
};

// ─── PARENT PROFILE ───────────────────────────────────────────
const ParentProfile = ({ user, showToast }) => {
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
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/profile/parent`, { headers:{'Authorization':`Bearer ${token}`} })
      .then(r => r.json())
      .then(data => {
        if (data.first_name) setFirstName(data.first_name);
        if (data.last_name) setLastName(data.last_name);
        if (data.phone) setPhone(data.phone || "");
        if (data.address) setAddress(data.address || "");
        if (data.postal_code) setPostalCode(data.postal_code || "");
        if (data.city) setCity(data.city || "");
        if (data.country) setCountry(data.country || "France");
        if (data.birth_date) setBirthDate(data.birth_date?.slice(0,10) || "");
        if (data.birth_place) setBirthPlace(data.birth_place || "");
      }).catch(console.error);
  }, []);
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/parent`, {
        method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({ firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace })
      });
      const data = await res.json();
      if (res.ok) showToast("✅ Profil mis à jour !", "ok");
      else showToast("❌ " + data.error, "err");
    } catch(e) { showToast("❌ Erreur de connexion.", "err"); }
    setSaving(false);
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>👤 Mon profil</div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>Gérez vos informations personnelles</div>
        </div>
        <Btn onClick={handleSave} variant="teal" disabled={saving}>{saving?"Sauvegarde…":"💾 Sauvegarder"}</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>👤 Informations personnelles</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Prénom" value={firstName} onChange={setFirstName} placeholder="Sophie" />
            <Input label="Nom" value={lastName} onChange={setLastName} placeholder="Dupont" />
          </div>
          <Input label="Téléphone" value={phone} onChange={setPhone} placeholder="+33 6 12 34 56 78" icon="📱" />
          <Input label="Date de naissance" type="date" value={birthDate} onChange={setBirthDate} icon="🎂" />
          <Input label="Lieu de naissance" value={birthPlace} onChange={setBirthPlace} placeholder="Paris, France" icon="📍" />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Pays</label>
            <select value={country} onChange={e=>setCountry(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
              {["France","Belgique","Suisse","Canada","Maroc","Sénégal","Côte d'Ivoire","Algérie","Tunisie","Autre"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>🏠 Adresse complète</div>
          <Input label="Adresse" value={address} onChange={setAddress} placeholder="12 rue de la Paix" icon="🏠" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
            <Input label="Code postal" value={postalCode} onChange={setPostalCode} placeholder="75001" />
            <Input label="Ville" value={city} onChange={setCity} placeholder="Paris" icon="📍" />
          </div>
          <div style={{ background:G.teal+"11", border:`1px solid ${G.teal}33`, borderRadius:10, padding:14, marginTop:8 }}>
            <div style={{ fontSize:"0.78rem", color:G.muted, lineHeight:1.7 }}>
              📍 Votre adresse est utilisée pour trouver les babysitters les plus proches. Elle n'est jamais partagée publiquement.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── SEARCH ───────────────────────────────────────────────────
const SearchSitters = ({ onBook, showToast }) => {
  const [search, setSearch] = useState("");
  const [filterCam, setFilterCam] = useState(false);
  const [selected, setSelected] = useState(null);
  const filtered = SITTERS_LIST.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterCam || s.camera)
  );
  if (selected) return <BookingForm sitter={selected} onBack={() => setSelected(null)} onConfirm={(b) => { onBook(b); setSelected(null); showToast("🎉 Demande envoyée !", "ok"); }} />;
  return (
    <div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:4 }}>Trouver un babysitter</div>
      <div style={{ color:G.muted, fontSize:"0.88rem", marginBottom:20 }}>Tous nos babysitters sont vérifiés et certifiés.</div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Nom, ville, compétence…" style={{ flex:1, background:G.card, border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 16px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }} />
        <button onClick={() => setFilterCam(!filterCam)} style={{ padding:"10px 16px", borderRadius:10, border:`1.5px solid ${filterCam?G.teal:G.border}`, background:filterCam?G.teal+"22":"transparent", color:filterCam?G.teal:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" }}>
          📹 Caméra uniquement
        </button>
      </div>
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
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>🎂 {s.age} ans · 📍 {s.city}</div>
              </div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.1rem" }}>{s.price}€<span style={{ fontSize:"0.65rem", color:G.muted }}>/h</span></div>
            </div>
            <div style={{ fontSize:"0.8rem", color:G.muted, marginBottom:12, lineHeight:1.5 }}>{s.bio}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
              {s.tags.map(t => <Badge key={t} color={G.purple}>{t}</Badge>)}
              {s.camera && <Badge color={G.teal}>📹 Caméra</Badge>}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`1px solid ${G.border}`, paddingTop:12 }}>
              <div style={{ fontSize:"0.82rem", color:G.muted }}>⭐ {s.rating} · {s.missions} gardes</div>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} style={{ background:"none", border:"none", fontSize:"1.3rem", cursor:"pointer", padding:4 }}>
  {favorites.includes(s.id) ? "❤️" : "🤍"}
</button>
              <Btn onClick={() => s.available && setSelected(s)} variant={s.available?"teal":"ghost"} size="sm" disabled={!s.available}>
                {s.available ? "Réserver →" : "Indisponible"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── BOOKING FORM ─────────────────────────────────────────────
const BookingForm = ({ sitter, onBack, onConfirm }) => {
  const [showPayment, setShowPayment] = useState(false);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [date, setDate] = useState(tomorrow.toISOString().slice(0,10));
  const [time, setTime] = useState("18:30");
  const [duration, setDuration] = useState("3");
  const [children, setChildren] = useState("1");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [camera, setCamera] = useState(sitter.camera);
  const price = parseInt(duration) * sitter.price + (camera ? parseInt(duration) * 2 : 0);
  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:"0.85rem", marginBottom:20 }}>← Retour</button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#fff", marginBottom:20 }}>Détails de la réservation</div>
          <Input label="Date" type="date" value={date} onChange={setDate} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Heure de début" type="time" value={time} onChange={setTime} />
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Durée (heures)</label>
              <select value={duration} onChange={e=>setDuration(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                {["2","3","4","5","6"].map(d=><option key={d} value={d}>{d}h</option>)}
              </select>
            </div>
          </div>
          <Input label="Adresse" value={address} onChange={setAddress} placeholder="12 rue de la Paix, 75001 Paris" icon="📍" />
          <Input label="Notes (optionnel)" value={notes} onChange={setNotes} placeholder="Allergies, routines, code d'entrée…" />
          {sitter.camera && (
            <div onClick={() => setCamera(!camera)} style={{ display:"flex", alignItems:"center", gap:14, background:camera?G.teal+"18":"rgba(255,255,255,0.04)", border:`1.5px solid ${camera?G.teal+"44":G.border}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", marginBottom:20 }}>
              <div style={{ width:44, height:24, background:camera?G.teal:"rgba(255,255,255,0.15)", borderRadius:12, position:"relative", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left:camera?23:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s" }} />
              </div>
              <div>
                <div style={{ fontWeight:700, color:camera?G.teal:G.text, fontSize:"0.88rem" }}>📹 Surveillance caméra</div>
                <div style={{ color:G.muted, fontSize:"0.75rem" }}>Flux vidéo chiffré · +2€/h</div>
              </div>
            </div>
          )}
{showPayment && (
  <PaymentModal
    booking={{ id:"temp", sitterName:sitter.name, date, time, duration:duration+"h", children:parseInt(children), address, camera, price }}
    onClose={() => setShowPayment(false)}
    onSuccess={() => onConfirm({ id:"BK"+Date.now(), sitterId:sitter.id, sitterName:sitter.name, sitterAvatar:sitter.avatar, date, time, duration:duration+"h", children:parseInt(children), address, notes, camera, status:"confirmed", price, createdAt:new Date().toISOString().slice(0,10) })}
    showToast={() => {}}
  />
)}
<Btn onClick={() => { if(!address){alert("Renseignez l'adresse."); return;} setShowPayment(true); }} variant="teal" size="lg" full>
  💳 Procéder au paiement →
</Btn>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Babysitter</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <span style={{ fontSize:"2.5rem" }}>{sitter.avatar}</span>
              <div>
                <div style={{ fontWeight:700, color:"#fff" }}>{sitter.name}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {sitter.city} · ⭐ {sitter.rating}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Estimation</div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.82rem" }}>
              <span style={{ color:G.muted }}>Garde {duration}h × {sitter.price}€/h</span>
              <span style={{ color:G.text }}>{parseInt(duration)*sitter.price}€</span>
            </div>
            {camera && <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.82rem" }}>
              <span style={{ color:G.muted }}>Caméra {duration}h × 2€/h</span>
              <span style={{ color:G.text }}>{parseInt(duration)*2}€</span>
            </div>}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>
              <span style={{ color:"#fff" }}>Total estimé</span>
              <span style={{ color:G.teal, fontSize:"1.2rem" }}>{price}€</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── REVIEW MODAL ─────────────────────────────────────────────
const ReviewModal = ({ booking, onClose, onSubmit }) => {
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
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:10 }}>Note globale</label>
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
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Votre commentaire</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Décrivez votre expérience avec ce babysitter… Était-il/elle ponctuel(le) ? Comment se sont passées les interactions avec votre enfant ?"
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
            <Btn onClick={onClose} variant="ghost" full>Annuler</Btn>
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
const ParentBookings = ({ user, bookings, onCancel, onNav, onReview }) => {
  const [filter, setFilter] = useState("all");
  const [reviewBooking, setReviewBooking] = useState(null);
  const my = bookings.filter(b => b.parentId === user.id);
  const tabs = [["all","Toutes"],["pending","En attente"],["confirmed","Confirmées"],["completed","Terminées"]];
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
        />
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>Mes gardes</div>
          <div style={{ color:G.muted, fontSize:"0.85rem" }}>Suivi de toutes vos demandes</div>
        </div>
        <Btn onClick={() => onNav("search")} variant="teal">+ Nouvelle réservation</Btn>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${filter===id?G.teal:G.border}`, background:filter===id?G.teal+"22":"transparent", color:filter===id?G.teal:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px", color:G.muted }}>Aucune garde dans cette catégorie.</div>}
        {filtered.map(b => (
          <Card key={b.id}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
              <span style={{ fontSize:"2.2rem" }}>{b.sitterAvatar}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{b.sitterName}</span>
                  <StatusBadge status={b.status} />
                  {b.camera && <Badge color={G.teal}>📹 Caméra</Badge>}
                  <span style={{ marginLeft:"auto", fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal }}>{b.price}€</span>
                </div>
                <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:4 }}>📅 {b.date} à {b.time} · ⏱ {b.duration} · 👶 {b.children} enfant{b.children>1?"s":""}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {b.address}</div>
                {b.notes && <div style={{ fontSize:"0.75rem", color:G.muted, background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 10px", marginTop:8 }}>💬 {b.notes}</div>}

                {/* Avis existant */}
                {b.rating && (
                  <div style={{ marginTop:10, background:G.amber+"11", border:`1px solid ${G.amber}33`, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <span style={{ color:G.amber }}>{"⭐".repeat(b.rating)}</span>
                      <span style={{ fontSize:"0.72rem", color:G.muted }}>Votre avis</span>
                    </div>
                    {b.review && <div style={{ fontSize:"0.8rem", color:G.text, lineHeight:1.5 }}>"{b.review}"</div>}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {b.camera && b.status==="confirmed" && <Btn onClick={() => onNav("camera")} variant="teal" size="sm">📹 Live</Btn>}
                {b.status==="pending" && <Btn onClick={() => onCancel(b.id)} variant="danger" size="sm">Annuler</Btn>}
                {b.status==="completed" && !b.rating && (
                  <Btn onClick={() => setReviewBooking(b)} variant="amber" size="sm">⭐ Noter</Btn>
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
const SitterHome = ({ user, bookings, onNav }) => {
  const my = bookings.filter(b => b.sitterId === user.id);
  const upcoming = my.filter(b=>b.status==="confirmed"||b.status==="pending");
  const earnings = my.filter(b=>b.status==="completed").reduce((s,b)=>s+b.price,0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"linear-gradient(135deg,#1a2510,#0f1a0a)", borderRadius:18, padding:"32px 28px", border:`1px solid ${G.amber}33` }}>
        <div style={{ fontSize:"0.78rem", fontWeight:700, color:G.amber, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Bienvenue 👋</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:"#fff", marginBottom:6 }}>{user.name}</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:20 }}>Votre espace babysitter — gérez vos missions.</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={() => onNav("missions")} variant="amber">📋 Mes missions</Btn>
          <Btn onClick={() => onNav("profile")} variant="ghost">👤 Mon profil</Btn>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Missions à venir",   val:upcoming.length,                                  icon:"📅", color:G.amber },
          { label:"En attente réponse", val:my.filter(b=>b.status==="pending").length,         icon:"⏳", color:G.coral },
          { label:"Missions réalisées", val:my.filter(b=>b.status==="completed").length,       icon:"✅", color:G.green },
          { label:"Gains ce mois",      val:earnings+"€",                                      icon:"💰", color:G.teal  },
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
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>Prochaine mission</div>
            <StatusBadge status={upcoming[0].status} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:"2rem" }}>👨‍👧</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"#fff" }}>{upcoming[0].parentName}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📅 {upcoming[0].date} à {upcoming[0].time} · ⏱ {upcoming[0].duration}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem" }}>📍 {upcoming[0].address}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.2rem" }}>{upcoming[0].price}€</div>
              {upcoming[0].camera && <Badge color={G.teal} style={{marginTop:6}}>📹 Caméra</Badge>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── SITTER MISSIONS ──────────────────────────────────────────
const SitterMissions = ({ user, bookings, onAccept, onDecline }) => {
  const [filter, setFilter] = useState("all");
  const my = bookings.filter(b => b.sitterId === user.id);
  const tabs = [["all","Toutes"],["pending","À confirmer"],["confirmed","Confirmées"],["completed","Terminées"]];
  const filtered = filter==="all" ? my : my.filter(b=>b.status===filter);
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff" }}>Mes missions</div>
        <div style={{ color:G.muted, fontSize:"0.85rem" }}>Gérez les demandes et missions en cours.</div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${filter===id?G.amber:G.border}`, background:filter===id?G.amber+"22":"transparent", color:filter===id?G.amber:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"40px", color:G.muted }}>Aucune mission ici.</div>}
        {filtered.map(b => (
          <Card key={b.id}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <span style={{ fontSize:"2rem" }}>👨‍👧</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>{b.parentName}</span>
                  <StatusBadge status={b.status} />
                  {b.camera && <Badge color={G.teal}>📹 Caméra</Badge>}
                  <span style={{ marginLeft:"auto", fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.teal, fontSize:"1.1rem" }}>{b.price}€</span>
                </div>
                <div style={{ color:G.muted, fontSize:"0.78rem", marginBottom:4 }}>📅 {b.date} à {b.time} · ⏱ {b.duration} · 👶 {b.children} enfant{b.children>1?"s":""}</div>
                <div style={{ color:G.muted, fontSize:"0.78rem" }}>📍 {b.address}</div>
                {b.notes && <div style={{ fontSize:"0.75rem", color:G.muted, background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 10px", marginTop:8 }}>💬 {b.notes}</div>}
              </div>
              {b.status==="pending" && (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <Btn onClick={() => onAccept(b.id)} variant="teal" size="sm">✅ Accepter</Btn>
                  <Btn onClick={() => onDecline(b.id)} variant="danger" size="sm">✕ Refuser</Btn>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── SITTER PROFILE ───────────────────────────────────────────
const SitterProfile = ({ user, bookings, showToast }) => {
  const my = bookings.filter(b => b.sitterId === user.id && b.status === "completed");
  const [tab, setTab] = useState("profile"); // profile | identity | stats
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
    setUploadError("Erreur de connexion.");
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
      if (data.bio) setBio(data.bio || "");
      if (data.hourly_rate) setHourlyRate(String(data.hourly_rate));
      if (data.skills) setSkills(data.skills || []);
      if (data.available !== undefined) setAvailable(data.available);
      if (data.accepts_camera !== undefined) setAcceptsCamera(data.accepts_camera);
      if (data.verification_status) setVerifyStatus(data.verification_status);
    })
    .catch(console.error);
  }, []);

 const handleSave = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem('token');
    
    // Géocoder l'adresse
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
    if (res.ok) showToast("✅ Profil mis à jour !", "ok");
    else showToast("❌ " + data.error, "err");
  } catch(e) {
    showToast("❌ Erreur de connexion.", "err");
  }
  setSaving(false);
};

  const handleVerifyIdentity = async () => {
    if (!docNumber || !birthDate) { showToast("⚠️ Remplissez tous les champs.", "err"); return; }
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
      showToast("❌ Erreur de connexion.", "err");
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
    if (verifyStatus === "verified") return <Badge color={G.green}>✅ Identité vérifiée</Badge>;
    if (verifyStatus === "pending")  return <Badge color={G.amber}>⏳ Vérification en cours</Badge>;
    return <Badge color={G.coral}>❌ Non vérifié</Badge>;
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
          {saving ? "Sauvegarde…" : "💾 Sauvegarder"}
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:24, borderBottom:`1px solid ${G.border}`, paddingBottom:0 }}>
        {[["profile","👤 Mon profil"],["identity","🪪 Vérification identité"],["stats","📊 Mes statistiques"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:"10px 18px", background:"none", border:"none", borderBottom: tab===id?`2px solid ${G.amber}`:"2px solid transparent", color: tab===id?G.amber:G.muted, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.85rem", cursor:"pointer", marginBottom:"-1px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB PROFIL ── */}
      {tab === "profile" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>Informations personnelles</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Prénom" value={firstName} onChange={setFirstName} placeholder="Camille" />
              <Input label="Nom" value={lastName} onChange={setLastName} placeholder="Bertrand" />
            </div>
            <Input label="Téléphone" value={phone} onChange={setPhone} placeholder="+33 6 12 34 56 78" icon="📱" />
            <Input label="Ville" value={city} onChange={setCity} placeholder="Paris 11e" icon="📍" />
            <Input label="Date de naissance" type="date" value={birthDate} onChange={setBirthDate} icon="🎂" />
            <Input label="Lieu de naissance" value={birthPlace} onChange={setBirthPlace} placeholder="Paris, France" icon="📍" />
            <Input label="Adresse" value={address} onChange={setAddress} placeholder="12 rue de la Paix" icon="🏠" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
              <Input label="Code postal" value={postalCode} onChange={setPostalCode} placeholder="75011" />
            <Input label="Ville" value={city} onChange={setCity} placeholder="Paris 11e" icon="📍" />
              <Input label="Ville" value={city} onChange={setCity} placeholder="Paris" />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Pays</label>
              <select value={country} onChange={e=>setCountry(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                {["France","Belgique","Suisse","Canada","Maroc","Sénégal","Côte d'Ivoire","Algérie","Tunisie","Autre"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
           <Input label="Tarif horaire (€/h)" type="number" value={hourlyRate} onChange={setHourlyRate} placeholder="12" icon="💶" />
         
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>Bio & Compétences</div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Bio</label>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Décrivez votre expérience, vos qualités, ce qui vous distingue…" style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:100 }} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>Compétences</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                {skills.map(s => (
                  <span key={s} style={{ display:"inline-flex", alignItems:"center", gap:5, background:G.purple+"22", color:G.purple, border:`1px solid ${G.purple}44`, borderRadius:100, padding:"3px 10px", fontSize:"0.75rem", fontWeight:600 }}>
                    {s}
                    <button onClick={() => removeSkill(s)} style={{ background:"none", border:"none", color:G.purple, cursor:"pointer", fontSize:"0.8rem", lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyPress={e=>e.key==="Enter"&&addSkill()} placeholder="Ajouter une compétence…" style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"8px 12px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", outline:"none" }} />
                <Btn onClick={addSkill} variant="ghost" size="sm">+ Ajouter</Btn>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>Préférences</div>
            {[
              { label:"Disponible pour nouvelles gardes", sub:"Votre profil apparaît dans les recherches", val:available, set:setAvailable, color:G.green },
              { label:"J'accepte la surveillance caméra", sub:"Les parents peuvent activer le flux vidéo", val:acceptsCamera, set:setAcceptsCamera, color:G.teal },
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
  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>Documents certifiés</div>
  {[
    { label:"🆔 Pièce d'identité", status: verifyStatus==="verified"?"Vérifiée ✓":verifyStatus==="pending"?"En cours…":"Non vérifiée", color: verifyStatus==="verified"?G.green:verifyStatus==="pending"?G.amber:G.coral },
    { label:"🏥 Premiers secours", status:"À renseigner", color:G.muted },
    { label:"🚔 Casier judiciaire", status:"À renseigner", color:G.muted },
  ].map(d => (
    <div key={d.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
      <span style={{ color:G.text, fontSize:"0.85rem" }}>{d.label}</span>
      <span style={{ color:d.color, fontWeight:600, fontSize:"0.75rem" }}>{d.status}</span>
    </div>
  ))}
  <button onClick={() => setTab("identity")} style={{ marginTop:14, background:"none", border:"none", color:G.teal, fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>
    → Vérifier mon identité
  </button>
</Card>
        </div>
      )}

      {/* ── TAB IDENTITÉ ── */}
      {tab === "identity" && (
        <div style={{ maxWidth:600 }}>
          {verifyStatus === "verified" && (
            <Card style={{ borderColor:G.green+"44", marginBottom:20, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>✅</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:"#fff", fontSize:"1.2rem", marginBottom:8 }}>Identité vérifiée</div>
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>Votre identité a été vérifiée par notre équipe. Un badge apparaît sur votre profil.</div>
            </Card>
          )}

          {verifyStatus === "pending" && (
            <Card style={{ borderColor:G.amber+"44", marginBottom:20, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⏳</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:"#fff", fontSize:"1.2rem", marginBottom:8 }}>Vérification en cours</div>
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>Notre équipe vérifie votre identité. Vous recevrez un email dans les 24-48 heures.</div>
            </Card>
          )}

          {verifyStatus === "unverified" && (
            <Card>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:8 }}>🪪 Vérification d'identité</div>
              <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:20, lineHeight:1.6 }}>
                La vérification d'identité renforce la confiance des parents. Un badge ✅ apparaîtra sur votre profil une fois vérifié.
              </div>

              <div style={{ background:G.teal+"11", border:`1px solid ${G.teal}33`, borderRadius:10, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:"0.82rem", color:G.muted, lineHeight:1.8 }}>
                  📋 Ce dont vous avez besoin :<br/>
                  • Carte nationale d'identité <strong style={{color:G.text}}>OU</strong> Passeport<br/>
                  • Date de naissance<br/>
                  • Les informations doivent correspondre à votre compte
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Type de document</label>
                <select value={docType} onChange={e=>setDocType(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                  <option value="carte_identite">🪪 Carte nationale d'identité</option>
                  <option value="passeport">📕 Passeport</option>
                  <option value="titre_sejour">📄 Titre de séjour</option>
                </select>
              </div>
                          <div style={{ background:G.card, borderRadius:8, padding:"10px 12px", marginBottom:16, fontSize:"0.78rem", color:G.muted, lineHeight:1.6 }}>
                {docType==="carte_identite" && "📋 Prenez une photo nette du recto de votre CNI. Assurez-vous que le nom, prénom et numéro sont lisibles."}
                {docType==="passeport" && "📋 Photographiez la page principale de votre passeport avec votre photo et vos informations personnelles."}
                {docType==="titre_sejour" && "📋 Prenez une photo nette du recto de votre titre de séjour en cours de validité."}
              </div>
             <Input label="Numéro du document" value={docNumber} onChange={setDocNumber} placeholder="Ex: 123456789" icon="🔢" />
              <Input label="Date de naissance" type="date" value={birthDate} onChange={setBirthDate} />
           <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>
                  📷 Photo de votre {docType==="carte_identite"?"Carte Nationale d'Identité (recto)":docType==="passeport"?"Passeport (page principale)":"Titre de séjour (recto)"}
                </label>
                <div style={{ border:`2px dashed ${G.border}`, borderRadius:12, padding:20, textAlign:"center", cursor:"pointer", background:"rgba(255,255,255,0.02)", position:"relative" }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleUploadId(e.dataTransfer.files[0]); }}>
                  <input type="file" accept="image/*" onChange={e => handleUploadId(e.target.files[0])} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer" }} />
                  {uploadedUrl ? (
                    <div>
                      <div style={{ fontSize:"2rem", marginBottom:8 }}>✅</div>
                      <div style={{ color:G.green, fontWeight:600, fontSize:"0.85rem" }}>Document uploadé !</div>
                      <div style={{ color:G.muted, fontSize:"0.72rem", marginTop:4 }}>Cliquez pour changer</div>
                    </div>
                  ) : uploadingDoc ? (
                    <div>
                      <div style={{ fontSize:"1.5rem", marginBottom:8 }}>⏳</div>
                      <div style={{ color:G.muted, fontSize:"0.85rem" }}>Upload en cours…</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:"2.5rem", marginBottom:8, opacity:0.4 }}>{docType==="carte_identite"?"🪪":docType==="passeport"?"📕":"📄"}</div>
                      <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:4 }}>
                        Glissez votre {docType==="carte_identite"?"CNI":docType==="passeport"?"passeport":"titre de séjour"} ici
                      </div>
                      <div style={{ color:G.muted, fontSize:"0.72rem" }}>ou cliquez pour sélectionner · JPG, PNG · Max 5MB</div>
                    </div>
                  )}
                </div>
                {uploadError && <div style={{ color:G.coral, fontSize:"0.78rem", marginTop:8 }}>⚠️ {uploadError}</div>}
              </div>
              <div style={{ background:"rgba(251,191,36,0.08)", border:`1px solid ${G.amber}33`, borderRadius:10, padding:12, marginBottom:20, fontSize:"0.78rem", color:G.muted, lineHeight:1.6 }}>
                🔒 <strong style={{color:G.text}}>Confidentialité :</strong> Vos informations sont chiffrées et utilisées uniquement pour la vérification. Elles ne sont jamais partagées avec les parents.
              </div>

{/* Instructions selon type de document */}
<div style={{ background:G.card, borderRadius:8, padding:"10px 12px", marginBottom:16, fontSize:"0.78rem", color:G.muted, lineHeight:1.6 }}>
  {docType === "carte_identite" && "📋 Prenez une photo nette du recto de votre CNI. Assurez-vous que le nom, prénom et numéro sont lisibles."}
  {docType === "passeport" && "📋 Photographiez la page principale de votre passeport avec votre photo et vos informations personnelles."}
  {docType === "titre_sejour" && "📋 Prenez une photo nette du recto de votre titre de séjour en cours de validité."}
</div>

{/* Zone upload */}
<div style={{ marginBottom:20 }}>
  <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:8 }}>
    📷 Photo de votre {
      docType === "carte_identite" ? "Carte Nationale d'Identité (recto)" :
      docType === "passeport" ? "Passeport (page principale)" :
      "Titre de séjour (recto)"
    }
  </label>
  <div style={{ border:`2px dashed ${G.border}`, borderRadius:12, padding:20, textAlign:"center", cursor:"pointer", background:"rgba(255,255,255,0.02)", position:"relative" }}
    onDragOver={e => e.preventDefault()}
    onDrop={e => { e.preventDefault(); handleUploadId(e.dataTransfer.files[0]); }}>
    <input type="file" accept="image/*" onChange={e => handleUploadId(e.target.files[0])} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer" }} />
    {uploadedUrl ? (
      <div>
        <div style={{ fontSize:"2rem", marginBottom:8 }}>✅</div>
        <div style={{ color:G.green, fontWeight:600, fontSize:"0.85rem" }}>Document uploadé !</div>
        <div style={{ color:G.muted, fontSize:"0.72rem", marginTop:4 }}>Cliquez pour changer</div>
      </div>
    ) : uploadingDoc ? (
      <div>
        <div style={{ fontSize:"1.5rem", marginBottom:8 }}>⏳</div>
        <div style={{ color:G.muted, fontSize:"0.85rem" }}>Upload en cours…</div>
      </div>
    ) : (
      <div>
        <div style={{ fontSize:"2.5rem", marginBottom:8, opacity:0.4 }}>
          {docType === "carte_identite" ? "🪪" : docType === "passeport" ? "📕" : "📄"}
        </div>
        <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:4 }}>
          Glissez votre {
            docType === "carte_identite" ? "CNI" :
            docType === "passeport" ? "passeport" :
            "titre de séjour"
          } ici
        </div>
        <div style={{ color:G.muted, fontSize:"0.72rem" }}>ou cliquez pour sélectionner · JPG, PNG · Max 5MB</div>
      </div>
    )}
  </div>
  {uploadError && <div style={{ color:G.coral, fontSize:"0.78rem", marginTop:8 }}>⚠️ {uploadError}</div>}
</div>

              <Btn onClick={handleVerifyIdentity} variant="teal" size="lg" full disabled={verifying}>
                {verifying ? "Envoi en cours…" : "📤 Soumettre pour vérification →"}
              </Btn>
            </Card>
          )}

          <Card style={{ marginTop:16 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Comment ça fonctionne ?</div>
            {[
              ["1️⃣", "Soumettez vos informations", "Remplissez le formulaire avec les infos de votre document d'identité"],
              ["2️⃣", "Vérification par notre équipe", "Notre équipe vérifie vos informations sous 24-48h"],
              ["3️⃣", "Badge ✅ sur votre profil", "Les parents voient que vous êtes vérifié et font plus confiance"],
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
            { icon:"✅", label:"Missions réalisées", val:my.length, color:G.green },
            { icon:"💰", label:"Total gagné", val:my.reduce((s,b)=>s+b.price,0)+"€", color:G.teal },
            { icon:"⭐", label:"Note moyenne", val:"4.9", color:G.amber },
            { icon:"👶", label:"Enfants gardés", val:my.reduce((s,b)=>s+(b.children||1),0), color:G.purple },
            { icon:"⏱", label:"Heures de garde", val:my.reduce((s,b)=>s+parseInt(b.duration||0),0)+"h", color:G.coral },
            { icon:"📹", label:"Gardes avec caméra", val:my.filter(b=>b.camera).length, color:G.teal },
          ].map(s => (
            <Card key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.8rem", color:s.color, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:"0.75rem", color:G.muted }}>{s.label}</div>
            </Card>
          ))}

          <Card style={{ gridColumn:"1 / -1" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Dernières missions</div>
            {my.length === 0 && <div style={{ color:G.muted, fontSize:"0.85rem" }}>Aucune mission terminée pour le moment.</div>}
            {my.slice(0,5).map(b => (
              <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                <span style={{ fontSize:"1.5rem" }}>👨‍👧</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:"0.85rem", color:G.text }}>{b.parentName}</div>
                  <div style={{ color:G.muted, fontSize:"0.75rem" }}>{b.date} · {b.duration} · {b.children} enfant{b.children>1?"s":""}</div>
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
const CameraPage = ({ user }) => {
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
    } catch(e) { alert("Accès caméra refusé."); }
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
          {user.role==="parent" ? "📹 Surveillance en direct" : "📷 Flux caméra mission"}
        </div>
        <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:16 }}>Flux vidéo chiffré pair-à-pair.</div>
        <div style={{ background:"#000", borderRadius:16, overflow:"hidden", position:"relative", aspectRatio:"16/9", border:`1px solid ${G.border}`, marginBottom:14 }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:active?"block":"none", transform:"scaleX(-1)" }} />
          {!active && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:G.muted }}>
              <div style={{ fontSize:"3rem", opacity:0.25 }}>📷</div>
              <div style={{ fontSize:"0.88rem" }}>Cliquez sur Démarrer</div>
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
                🏠 Domicile client · 🔒 Flux chiffré
              </div>
            </>
          )}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {!active
            ? <Btn onClick={start} variant="teal" size="lg">▶ Démarrer le flux</Btn>
            : <Btn onClick={stop} variant="coral" size="lg">⏹ Arrêter</Btn>
          }
          {active && <Btn onClick={() => { const c=document.createElement("canvas"); const v=videoRef.current; c.width=v.videoWidth||640; c.height=v.videoHeight||360; c.getContext("2d").drawImage(v,0,0); c.toBlob(b=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="bw-"+Date.now()+".png"; a.click(); }); }} variant="ghost" size="lg">📸 Capture</Btn>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Statut</div>
          {[
            ["Caméra", active?"Active ●":"Inactive", active?G.green:G.muted],
            ["Chiffrement", "DTLS/SRTP", G.teal],
            ["Protocole", "WebRTC P2P", G.teal],
            ["Stockage", "Aucun", G.green],
          ].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.8rem" }}>
              <span style={{ color:G.muted }}>{l}</span>
              <span style={{ color:c, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:10 }}>🔒 Confidentialité</div>
          <div style={{ color:G.muted, fontSize:"0.78rem", lineHeight:1.7 }}>Flux pair-à-pair uniquement. <strong style={{ color:G.text }}>Aucune vidéo ne passe par nos serveurs.</strong></div>
        </Card>
      </div>
    </div>
  );
};

// ─── MAP VIEW ─────────────────────────────────────────────────
const MapView = ({ user, showToast }) => {
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
      <div style={{ color:G.muted, fontSize:"0.85rem", marginBottom:16 }}>Trouvez les babysitters disponibles dans votre quartier</div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un babysitter…" style={{ flex:1, minWidth:200, background:G.card, border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 16px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border}`, borderRadius:10, padding:"0 14px" }}>
          <span style={{ color:G.muted, fontSize:"0.78rem" }}>Rayon :</span>
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
                  <div style={{ fontSize:"0.65rem", color:G.muted }}>Tarif</div>
                </div>
                <div style={{ background:G.night, borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:G.amber }}>⭐ {selected.rating||"—"}</div>
                  <div style={{ fontSize:"0.65rem", color:G.muted }}>Note</div>
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
              <div style={{ color:G.muted, fontSize:"0.85rem" }}>Aucun babysitter dans ce rayon.</div>
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
const PaymentModal = ({ booking, onClose, onSuccess, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const formatCard = (val) => val.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
  const formatExpiry = (val) => val.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1/$2').slice(0,5);

  const handlePayment = async () => {
    if (!cardName || cardNumber.replace(/\s/g,'').length < 16 || expiry.length < 5 || cvv.length < 3) {
      setError("Veuillez remplir tous les champs correctement."); return;
    }
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: booking.price, bookingId: booking.id, sitterName: booking.sitterName })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      // Simuler confirmation (en production utiliser Stripe Elements)
      setTimeout(async () => {
        const confirmRes = await fetch(`${API}/payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ paymentIntentId: data.clientSecret.split('_secret')[0], bookingId: booking.id })
        });
        if (confirmRes.ok) { setPaid(true); setLoading(false); }
        else { setError("Erreur de confirmation."); setLoading(false); }
      }, 2000);
    } catch(e) { setError("Erreur de connexion."); setLoading(false); }
  };

  if (paid) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ maxWidth:420, width:"100%", textAlign:"center", padding:40 }}>
        <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🎉</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.5rem", color:"#fff", marginBottom:12 }}>Paiement réussi !</div>
        <div style={{ color:G.muted, fontSize:"0.9rem", marginBottom:8 }}>Votre réservation est confirmée.</div>
        <div style={{ color:G.teal, fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.3rem", marginBottom:24 }}>{booking.price}€ payés</div>
        <Btn onClick={() => { onSuccess(); onClose(); }} variant="teal" size="lg" full>Voir ma réservation →</Btn>
      </Card>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:G.panel, borderRadius:20, border:`1px solid ${G.border}`, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 24px 80px #0008" }}>

        {/* Header */}
        <div style={{ background:G.night, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.2rem", color:"#fff" }}>💳 Paiement sécurisé</div>
            <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:4 }}>Garde avec {booking.sitterName} · {booking.date}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:G.muted, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
        </div>

        <div style={{ padding:"28px" }}>

          {/* Récapitulatif */}
          <div style={{ background:G.card, borderRadius:12, padding:16, marginBottom:20, border:`1px solid ${G.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ color:G.muted, fontSize:"0.85rem" }}>Garde {booking.duration} · {booking.children} enfant{booking.children>1?"s":""}</span>
              <span style={{ color:G.text, fontWeight:600 }}>{booking.price}€</span>
            </div>
            {booking.camera && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:G.muted, fontSize:"0.85rem" }}>📹 Surveillance caméra</span>
                <span style={{ color:G.teal, fontWeight:600 }}>Inclus</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${G.border}`, paddingTop:10, marginTop:8 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff" }}>Total</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, color:G.teal, fontSize:"1.3rem" }}>{booking.price}€</span>
            </div>
          </div>

          {/* Formulaire carte */}
          <Input label="Nom sur la carte" value={cardName} onChange={setCardName} placeholder="SOPHIE DUPONT" icon="👤" />

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Numéro de carte</label>
            <div style={{ position:"relative" }}>
              <input
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px 10px 44px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none", letterSpacing:"0.05em" }}
              />
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1.2rem" }}>💳</span>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Date d'expiration</label>
              <input
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>CVV</label>
              <input
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                placeholder="123"
                maxLength={3}
                type="password"
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}
              />
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(45,212,191,0.06)", border:`1px solid ${G.teal}33`, borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:"0.78rem", color:G.muted }}>
            🔒 Paiement sécurisé via <strong style={{ color:G.teal, marginLeft:4 }}>Stripe</strong> · Données chiffrées SSL 256-bit
          </div>

          {error && <div style={{ background:"#ef444420", border:"1px solid #ef444444", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:"0.8rem", marginBottom:14 }}>⚠️ {error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={onClose} variant="ghost" full>Annuler</Btn>
            <Btn onClick={handlePayment} variant="teal" full disabled={loading}>
              {loading ? "Traitement en cours…" : `💳 Payer ${booking.price}€`}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
  const initPush = async () => {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.requestPermissions();
      await PushNotifications.register();
      PushNotifications.addListener('registration', token => {
        console.log('Push token:', token.value);
        // Envoyer le token au backend
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
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [bookings, setBookings] = useState(BOOKINGS_INIT);
  const [toast, showToast] = useToast();

  const handleLogin  = (u) => { setUser(u); setPage("home"); window.history.pushState({}, "", "/"); };
  const handleLogout = ()  => { setUser(null); setPage("home"); };

  const isConfirmPage = window.location.pathname === "/confirm" || (window.location.search.includes("token=") && !window.location.pathname.includes("reset"));
  const isResetPage   = window.location.pathname === "/reset-password" || (window.location.search.includes("token=") && window.location.pathname.includes("reset"));


  if (isConfirmPage) return (
    <>
      <style>{`@keyframes bw-blink{50%{opacity:0}} *{box-sizing:border-box} body{background:#0f1923}`}</style>
      <ConfirmPage onLogin={handleLogin} />
    </>
  );

  if (isResetPage) return (
    <>
      <style>{`*{box-sizing:border-box} body{background:#0f1923}`}</style>
      <ResetPasswordPage onBack={() => window.location.href = "/"} />
    </>
  );

  const addBooking     = (b)  => setBookings(prev => [{ ...b, parentId:user.id, parentName:user.name }, ...prev]);
  const cancelBooking  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Réservation annulée.", "err"); };
  const acceptMission  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"confirmed"} : b)); showToast("✅ Mission acceptée !", "ok"); };
  const declineMission = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Mission refusée.", "err"); };
  const addReview      = (id, rating, review) => { setBookings(prev => prev.map(b => b.id===id?{...b,rating,review}:b)); showToast("⭐ Avis publié avec succès !", "ok"); };


  if (!user) return (
    <>
      <style>{`
        @keyframes bw-blink{50%{opacity:0}}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
      `}</style>
      <AuthPage onLogin={handleLogin} />
      <Toast toast={toast} />
    </>
  );

  const isParent = user.role === "parent";

  const renderPage = () => {
    if (page==="home")     return isParent ? <ParentHome user={user} bookings={bookings} onNav={setPage}/> : <SitterHome user={user} bookings={bookings} onNav={setPage}/>;
    if (page==="search")   return <SearchSitters onBook={addBooking} showToast={showToast}/>;
    if (page==="map")      return <MapView user={user} showToast={showToast}/>;
    if (page==="bookings") return <ParentBookings user={user} bookings={bookings} onCancel={cancelBooking} onNav={setPage} onReview={addReview}/>;
    if (page==="profile")  return isParent ? <ParentProfile user={user} showToast={showToast}/> : <SitterProfile user={user} bookings={bookings} showToast={showToast}/>;
    if (page==="missions") return <SitterMissions user={user} bookings={bookings} onAccept={acceptMission} onDecline={declineMission}/>;
    if (page==="profile")  return <SitterProfile user={user} bookings={bookings} showToast={showToast}/>;
    if (page==="camera")   return <CameraPage user={user}/>;
  
  return null;
    
};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;background:#0f1923;color:#e2e8f0}
        body { direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'}; }
        input,select,textarea{color:#e2e8f0!important}
        input:focus,select:focus,textarea:focus{border-color:#2dd4bf!important;outline:none!important}
        @keyframes bw-blink{50%{opacity:0}}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        select option{background:#162030}
      `}</style>
        <Nav user={user} activePage={page} onNav={setPage} onLogout={handleLogout} lang={lang} onLangChange={changeLang}/>      <main style={{ paddingTop:64, minHeight:"100vh" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
          {renderPage()}
        </div>
      </main>
      <Toast toast={toast}/>
    </>
  );
  }
