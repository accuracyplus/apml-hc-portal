  // App.jsx — Accuracy Plus Home Collection
  // Logo: upload your 480×150 banner as portal/public/logo.png
  // The image shows automatically; text brand shows until then.
  
  import { useState } from "react";
  import BookingForm    from "./views/BookingForm.jsx";
  import BookingConfirm from "./views/BookingConfirm.jsx";
  import StatusTracker  from "./views/StatusTracker.jsx";
  import strings        from "./i18n.js";
  
  export default function App() {
    const [lang,      setLang]     = useState("en");
    const [screen,    setScreen]   = useState("book");
    const [confirmed, setConfirmed] = useState(null);
  
    // t as function — for our components
    const t     = key => strings[lang]?.[key] ?? strings.en?.[key] ?? key;
    // tFull — full object, passed to legacy StatusIllustration (expects t[lang][status])
    const tFull = strings;
  
    const isRtl = lang === "ar";
  
    return (
      <div className={`portal-shell${isRtl ? " rtl" : ""}`}>
  
        {/* ══ HEADER ════════════════════════════════════════════════════ */}
        <header className="portal-header">
          <div className="header-top">
  
            {/* ── Logo area ──────────────────────────────────────── */}
            {/*
              LOGO SETUP:
              1. Export your logo as a white/light version (transparent bg)
              2. Save as exactly: portal/public/logo.png  (480×150 px recommended)
              3. Push to GitHub — it will appear here automatically
              Text brand below shows as fallback until logo.png is uploaded.
            */}
            <div style={{ position: "relative" }}>
              {/* Text fallback — always visible, hides when logo loads */}
              <div className="brand-text-fallback" id="brand-fallback">
                <div className="brand-name">Accuracy Plus</div>
                <div className="brand-sub">Medical Laboratory</div>
              </div>
              {/* Logo image */}
              <img
                src="/logo.png"
                alt="Accuracy Plus Medical Laboratory"
                className="portal-logo-banner"
                onLoad={e => {
                  e.target.style.display = "block";
                  const fb = document.getElementById("brand-fallback");
                  if (fb) fb.style.display = "none";
                }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
  
            {/* ── Language toggle ─────────────────────────────────── */}
            <div className="lang-toggle">
              {["en", "ar"].map(l => (
                <button
                  key={l}
                  className={`lang-btn${lang === l ? " active" : ""}`}
                  onClick={() => setLang(l)}>
                  {l === "en" ? "EN" : "عربي"}
                </button>
              ))}
            </div>
          </div>
  
          {/* ── Badge + tagline ─────────────────────────────────────── */}
          <div className="header-badge-row">
            <span className="hc-badge">Home Collection</span>
            <span className="hc-tagline">Bringing Healthcare Closer to You…</span>
          </div>
        </header>
  
        {/* ══ TABS (hidden on confirm screen) ══════════════════════════ */}
        {screen !== "confirm" && (
          <div className="screen-tabs">
            <button
              className={`screen-tab${screen === "book"  ? " active" : ""}`}
              onClick={() => setScreen("book")}>
              Request
            </button>
            <button
              className={`screen-tab${screen === "track" ? " active" : ""}`}
              onClick={() => setScreen("track")}>
              Track
            </button>
          </div>
        )}
  
        {/* ══ SCREENS ══════════════════════════════════════════════════ */}
        {screen === "book" && (
          <BookingForm
            lang={lang}
            t={t}
            onBooked={b => { setConfirmed(b); setScreen("confirm"); }}
          />
        )}
  
        {screen === "track" && (
        <StatusTracker
          lang={lang}
          t={t}
          {/* passed but StatusTracker now uses internal STATUS_CONFIG */}
          tFull={tFull}
        />
      )}

      {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="portal-footer">
        © {new Date().getFullYear()} Accuracy Plus Medical Laboratory · DHA Licensed
      </footer>
    </div>
  );
}
