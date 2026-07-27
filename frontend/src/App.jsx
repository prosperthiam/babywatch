import { useState, useEffect, useRef } from "react";
const API = 'https://babywatch-production.up.railway.app/api';
// ─── MOCK DATA ───────────────────────────────────────────────
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

// ─── AUTH ────────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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
    alert(`📧 ${data.message}`);
    setMode("login");
  } catch(e) {
    setError("Erreur de connexion au serveur.");
  }
};

  const demoLogin = (em) => { const user = USERS[em]; onLogin({ ...user, email: em }); };

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

// ─── NAV ─────────────────────────────────────────────────────
const Nav = ({ user, activePage, onNav, onLogout }) => {
  const isParent = user.role === "parent";
  const navItems = isParent
    ? [{ id:"home",label:"Accueil",icon:"🏠"},{id:"search",label:"Babysitters",icon:"🔍"},{id:"bookings",label:"Mes gardes",icon:"📋"},{id:"camera",label:"Caméra live",icon:"📹"}]
    : [{ id:"home",label:"Accueil",icon:"🏠"},{id:"missions",label:"Mes missions",icon:"📋"},{id:"profile",label:"Mon profil",icon:"👤"},{id:"camera",label:"Flux caméra",icon:"📹"}];
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
        <button onClick={onLogout} style={{ background:"rgba(255,95,87,0.12)", border:"1px solid rgba(255,95,87,0.25)", color:G.coral, padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>Déconnexion</button>
      </div>
    </nav>
  );
};

// ─── PARENT HOME ─────────────────────────────────────────────
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
          { label:"Gardes à venir",    val:upcoming.length,                                          icon:"📅", color:G.teal   },
          { label:"En attente",        val:myBookings.filter(b=>b.status==="pending").length,         icon:"⏳", color:G.amber  },
          { label:"Gardes effectuées", val:myBookings.filter(b=>b.status==="completed").length,       icon:"✅", color:G.green  },
          { label:"Babysitters favoris",val:2,                                                        icon:"⭐", color:G.purple },
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

// ─── SEARCH ──────────────────────────────────────────────────
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

// ─── BOOKING FORM ────────────────────────────────────────────
const BookingForm = ({ sitter, onBack, onConfirm }) => {
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
          <Btn onClick={() => { if(!address){alert("Renseignez l'adresse."); return;} onConfirm({id:"BK"+Date.now(),sitterId:sitter.id,sitterName:sitter.name,sitterAvatar:sitter.avatar,date,time,duration:duration+"h",children:parseInt(children),address,notes,camera,status:"pending",price,createdAt:new Date().toISOString().slice(0,10)}); }} variant="teal" size="lg" full>Envoyer la demande →</Btn>
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

// ─── PARENT BOOKINGS ─────────────────────────────────────────
const ParentBookings = ({ user, bookings, onCancel, onNav }) => {
  const [filter, setFilter] = useState("all");
  const my = bookings.filter(b => b.parentId === user.id);
  const tabs = [["all","Toutes"],["pending","En attente"],["confirmed","Confirmées"],["completed","Terminées"]];
  const filtered = filter==="all" ? my : my.filter(b=>b.status===filter);
  return (
    <div>
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
                {b.rating && <div style={{ marginTop:8, color:G.amber, fontSize:"0.8rem" }}>{"⭐".repeat(b.rating)} Noté</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {b.camera && b.status==="confirmed" && <Btn onClick={() => onNav("camera")} variant="teal" size="sm">📹 Live</Btn>}
                {b.status==="pending" && <Btn onClick={() => onCancel(b.id)} variant="danger" size="sm">Annuler</Btn>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── SITTER HOME ─────────────────────────────────────────────
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
          { label:"Missions à venir",      val:upcoming.length,                                        icon:"📅", color:G.amber  },
          { label:"En attente réponse",    val:my.filter(b=>b.status==="pending").length,               icon:"⏳", color:G.coral  },
          { label:"Missions réalisées",    val:my.filter(b=>b.status==="completed").length,             icon:"✅", color:G.green  },
          { label:"Gains ce mois",         val:earnings+"€",                                            icon:"💰", color:G.teal   },
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

// ─── SITTER MISSIONS ─────────────────────────────────────────
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

// ─── SITTER PROFILE ──────────────────────────────────────────
const SitterProfile = ({ user, bookings, showToast }) => {
  const me = SITTERS_LIST.find(s => s.id === user.id) || SITTERS_LIST[0];
  const my = bookings.filter(b => b.sitterId === user.id && b.status==="completed");
  const [avail, setAvail] = useState(true);
  const [camAccept, setCamAccept] = useState(true);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <span style={{ fontSize:"3.5rem" }}>{user.avatar}</span>
            <div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#fff" }}>{user.name}</div>
              <div style={{ color:G.muted, fontSize:"0.82rem", marginTop:3 }}>📍 {me.city} · 🎂 {me.age} ans</div>
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                <Badge color={G.green}>⭐ {me.rating}</Badge>
                <Badge color={G.purple}>{my.length} gardes</Badge>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Bio</label>
            <textarea defaultValue={me.bio} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${G.border}`, borderRadius:10, padding:"10px 14px", color:G.text, fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:80 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:G.muted, marginBottom:6 }}>Compétences</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {me.tags.map(t => <Badge key={t} color={G.purple}>{t}</Badge>)}
            </div>
          </div>
          <Btn onClick={() => showToast("✅ Profil mis à jour !", "ok")} variant="amber">Sauvegarder</Btn>
        </Card>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:16 }}>Préférences</div>
          {[
            { label:"Disponible pour nouvelles gardes", sub:"Votre profil apparaît dans les recherches", val:avail, set:setAvail, color:G.green },
            { label:"J'accepte la surveillance caméra", sub:"Les parents peuvent activer le flux vidéo", val:camAccept, set:setCamAccept, color:G.teal },
          ].map(opt => (
            <div key={opt.label} onClick={() => { opt.set(!opt.val); showToast("Préférence mise à jour", "ok"); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${G.border}`, cursor:"pointer" }}>
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
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Mes gains</div>
          {[
            ["Missions totales", my.length, G.amber],
            ["Note moyenne", me.rating+" ⭐", G.green],
            ["Tarif horaire", me.price+"€/h", G.purple],
            ["Total gagné", my.reduce((s,b)=>s+b.price,0)+"€", G.teal],
          ].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.83rem" }}>
              <span style={{ color:G.muted }}>{l}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:c }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, color:"#fff", marginBottom:14 }}>Documents</div>
          {[
            ["🆔 Pièce d'identité", "Vérifiée ✓", G.green],
            ["🚔 Casier judiciaire", "Vérifié ✓", G.green],
            ["🏥 Premiers secours", "PSC1 · 2024", G.teal],
            ["📋 Références", "3 vérifiées", G.teal],
          ].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:"0.8rem" }}>
              <span style={{ color:G.muted }}>{l}</span>
              <span style={{ color:c, fontWeight:600, fontSize:"0.72rem" }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─── CAMERA PAGE ─────────────────────────────────────────────
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

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [bookings, setBookings] = useState(BOOKINGS_INIT);
  const [toast, showToast] = useToast();

  const handleLogin  = (u) => { setUser(u); setPage("home"); };
  const handleLogout = ()  => { setUser(null); setPage("home"); };

  const addBooking     = (b)  => setBookings(prev => [{ ...b, parentId:user.id, parentName:user.name }, ...prev]);
  const cancelBooking  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Réservation annulée.", "err"); };
  const acceptMission  = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"confirmed"} : b)); showToast("✅ Mission acceptée !", "ok"); };
  const declineMission = (id) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status:"cancelled"} : b)); showToast("Mission refusée.", "err"); };

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
    if (page==="bookings") return <ParentBookings user={user} bookings={bookings} onCancel={cancelBooking} onNav={setPage}/>;
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
        input,select,textarea{color:#e2e8f0!important}
        input:focus,select:focus,textarea:focus{border-color:#2dd4bf!important;outline:none!important}
        @keyframes bw-blink{50%{opacity:0}}
        @keyframes bw-pulse{0%,100%{box-shadow:0 0 0 4px rgba(74,222,128,0.33)}50%{box-shadow:0 0 0 8px rgba(74,222,128,0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        select option{background:#162030}
      `}</style>
      <Nav user={user} activePage={page} onNav={setPage} onLogout={handleLogout}/>
      <main style={{ paddingTop:64, minHeight:"100vh" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
          {renderPage()}
        </div>
      </main>
      <Toast toast={toast}/>
    </>
  );
}