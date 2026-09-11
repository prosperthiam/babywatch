import { useState } from "react";
import { MENTIONS_LEGALES, CONFIDENTIALITE, CGU, LAST_UPDATE } from "./legalTexts.js";

// Palette alignée sur DESIGN.md
const C = {
  night:"#0f1923", panel:"#162030", card:"#1e2d40", sunk:"#0c141d",
  border:"rgba(255,255,255,0.07)", teal:"#2dd4bf",
  text:"#e8edf4", muted:"#8b9bb0", faint:"#5d6b7d",
};

// Rendu Markdown minimal — titres, gras, listes, tableaux.
// Volontairement sans dépendance externe.
function render(md) {
  const out = [];
  const lines = md.trim().split("\n");
  let i = 0, key = 0;

  const inline = (s) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={j} style={{ color:"#fff", fontWeight:600 }}>{part.slice(2,-2)}</strong>
        : part
    );

  while (i < lines.length) {
    const l = lines[i];

    if (l.startsWith("## ")) {
      out.push(
        <h2 key={key++} style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.15rem",
          color:"#fff", marginTop:36, marginBottom:12, letterSpacing:"-0.01em" }}>
          {l.slice(3)}
        </h2>
      );
      i++; continue;
    }

    if (l.startsWith("### ")) {
      out.push(
        <h3 key={key++} style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:"0.95rem",
          color:C.teal, marginTop:24, marginBottom:8 }}>
          {l.slice(4)}
        </h3>
      );
      i++; continue;
    }

    // Tableau
    if (l.startsWith("|") && lines[i+1]?.includes("---")) {
      const head = l.split("|").filter(c => c.trim()).map(c => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").filter(c => c.trim()).map(c => c.trim()));
        i++;
      }
      out.push(
        <div key={key++} style={{ overflowX:"auto", margin:"16px 0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem" }}>
            <thead>
              <tr>
                {head.map((h, j) => (
                  <th key={j} style={{ textAlign:"left", padding:"9px 12px", background:C.sunk,
                    color:C.muted, fontWeight:600, fontSize:"0.75rem", borderBottom:`1px solid ${C.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, j) => (
                <tr key={j}>
                  {r.map((c, k) => (
                    <td key={k} style={{ padding:"9px 12px", borderBottom:`1px solid ${C.border}`,
                      color:C.text, verticalAlign:"top" }}>
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Liste
    if (l.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2)); i++;
      }
      out.push(
        <ul key={key++} style={{ margin:"12px 0", paddingLeft:20, color:C.text, fontSize:"0.875rem", lineHeight:1.75 }}>
          {items.map((it, j) => <li key={j} style={{ marginBottom:5 }}>{inline(it)}</li>)}
        </ul>
      );
      continue;
    }

    if (l.trim() === "") { i++; continue; }

    // Paragraphe
    const para = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !lines[i].startsWith("|")) {
      para.push(lines[i]); i++;
    }
    out.push(
      <p key={key++} style={{ color:C.text, fontSize:"0.875rem", lineHeight:1.75, margin:"0 0 14px" }}>
        {inline(para.join(" "))}
      </p>
    );
  }
  return out;
}

const DOCS = {
  privacy: { title:"Politique de confidentialité", body:CONFIDENTIALITE },
  terms:   { title:"Conditions d'utilisation",     body:CGU },
  legal:   { title:"Mentions légales",             body:MENTIONS_LEGALES },
};

export default function LegalPage({ doc = "privacy", onBack }) {
  const [current, setCurrent] = useState(doc);
  const active = DOCS[current] || DOCS.privacy;

  return (
    <div style={{ minHeight:"100vh", background:C.night, color:C.text,
      fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .lg-wrap{max-width:760px;margin:0 auto;padding:0 24px}
        .lg-tab:focus-visible{outline:2px solid ${C.teal};outline-offset:2px}
      `}</style>

      {/* En-tête */}
      <header style={{ borderBottom:`1px solid ${C.border}`, position:"sticky", top:0,
        background:"rgba(15,25,35,0.94)", backdropFilter:"blur(12px)", zIndex:20 }}>
        <div className="lg-wrap" style={{ height:62, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.05rem", color:"#fff" }}>
            Baby<span style={{ color:C.teal }}>Watch</span>
          </span>
          {onBack && (
            <button onClick={onBack} className="lg-tab"
              style={{ background:"none", border:`1px solid ${C.border}`, color:C.muted,
                borderRadius:8, padding:"7px 14px", fontSize:"0.8rem", cursor:"pointer" }}>
              ← Retour
            </button>
          )}
        </div>
      </header>

      <main className="lg-wrap" style={{ paddingTop:40, paddingBottom:80 }}>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1.75rem",
          color:"#fff", letterSpacing:"-0.02em", marginBottom:6 }}>
          {active.title}
        </h1>
        <p style={{ color:C.faint, fontSize:"0.78rem", marginBottom:28 }}>
          Dernière mise à jour : {LAST_UPDATE}
        </p>

        {/* Navigation entre documents */}
        <nav style={{ display:"flex", gap:4, marginBottom:32, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap" }}>
          {Object.entries(DOCS).map(([k, d]) => (
            <button key={k} onClick={() => setCurrent(k)} className="lg-tab"
              style={{ padding:"10px 14px", background:"none", border:"none",
                borderBottom: current===k ? `2px solid ${C.teal}` : "2px solid transparent",
                color: current===k ? "#fff" : C.muted, fontSize:"0.82rem",
                fontWeight: current===k ? 600 : 400, cursor:"pointer", marginBottom:-1 }}>
              {d.title}
            </button>
          ))}
        </nav>

        <article>{render(active.body)}</article>
      </main>
    </div>
  );
}
