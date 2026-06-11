// App.jsx
import { useState } from "react";
import BookingForm    from "./views/BookingForm.jsx";
import BookingConfirm from "./views/BookingConfirm.jsx";
import StatusTracker  from "./views/StatusTracker.jsx";
import strings        from "./i18n.js";

export default function App() {
  const [lang,      setLang]     = useState("en");
  const [screen,    setScreen]   = useState("book");
  const [confirmed, setConfirmed] = useState(null);

  // t as function for our components
  const t = key => strings[lang]?.[key] ?? strings.en?.[key] ?? key;
  // Full strings object for StatusIllustration (legacy — expects t[lang][status])
  const tFull = strings;

  const isRtl = lang === "ar";

  return (
    <div className={`portal-shell${isRtl ? " rtl" : ""}`}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="portal-header">
        <div className="header-top">
          {/* Fallback brand text, hidden when logo loads */}
          <div className="brand-text-fallback" id="brand-fallback">
            <div className="brand-name">Accuracy Plus</div>
            <div className="brand-sub">Medical Laboratory</div>
          </div>
          {/* Upload your logo to portal/public/logo.png */}
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

          {/* Language toggle */}
          <div className="lang-toggle">
            {["en","ar"].map(l => (
              <button key={l} className={`lang-btn${lang === l ? " active" : ""}`}
                onClick={() => setLang(l)}>
                {l === "en" ? "EN" : "عربي"}
              </button>
            ))}
          </div>
        </div>

        <div className="header-badge-row">
          <span className="hc-badge">Home Collection</span>
          <span className="hc-tagline">Bringing Healthcare Closer to You…</span>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      {screen !== "confirm" && (
        <div className="screen-tabs">
          <button className={`screen-tab${screen === "book"  ? " active" : ""}`}
            onClick={() => setScreen("book")}>
            Request
          </button>
          <button className={`screen-tab${screen === "track" ? " active" : ""}`}
            onClick={() => setScreen("track")}>
            Track
          </button>
        </div>
      )}

      {/* ── Screens ─────────────────────────────────────────────── */}
      {screen === "book" && (
        <BookingForm lang={lang} t={t}
          onBooked={b => { setConfirmed(b); setScreen("confirm"); }} />
      )}
      {screen === "confirm" && (
        <BookingConfirm lang={lang} t={tFull} booking={confirmed}
          onTrack={() => setScreen("track")}
          onNew={()  => setScreen("book")} />
      )}
      {screen === "track" && (
        <StatusTracker lang={lang} t={t} tFull={tFull} />
      )}

      <footer className="portal-footer">
        © {new Date().getFullYear()} Accuracy Plus Medical Laboratory · DHA Licensed
      </footer>
    </div>
  );
}
