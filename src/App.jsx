// App.jsx — Accuracy Plus Home Collection — Dark Teal
import { useState } from "react";
import BookingForm    from "./views/BookingForm.jsx";
import BookingConfirm from "./views/BookingConfirm.jsx";
import StatusTracker  from "./views/StatusTracker.jsx";
import strings        from "./i18n.js";

export default function App() {
  const [lang,      setLang]     = useState("en");
  const [screen,    setScreen]   = useState("book");
  const [confirmed, setConfirmed] = useState(null);

  const t    = key => strings[lang]?.[key] ?? strings.en?.[key] ?? key;
  const tObj = strings[lang] ?? strings.en;

  const isRtl = lang === "ar";

  return (
    <div className={`portal-shell${isRtl ? " rtl" : ""}`}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="portal-header">
        <div className="brand-block">
          {/* Text brand — visible until logo.png loads */}
          <div className="brand-text-fallback" id="brand-fallback">
            <div className="brand-name">Accuracy Plus</div>
            <div className="brand-sub">Home Collection</div>
          </div>
          {/* Upload logo.png (480×150) to portal/public/ */}
          <img
            src="/logo.png"
            alt="Accuracy Plus Home Collection"
            className="portal-logo-banner"
            style={{ display: "none" }}
            onLoad={e => {
              e.target.style.display = "block";
              const fb = document.getElementById("brand-fallback");
              if (fb) fb.style.display = "none";
            }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <div className="brand-tagline">Bringing Healthcare Closer to You&hellip;</div>
        </div>

        <div className="lang-toggle">
          {["en","ar"].map(l => (
            <button key={l} className={`lang-btn${lang === l ? " active" : ""}`}
              onClick={() => setLang(l)}>
              {l === "en" ? "EN" : "عربي"}
            </button>
          ))}
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      {screen !== "confirm" && (
        <nav className="screen-tabs">
          <button className={`screen-tab${screen === "book"  ? " active" : ""}`}
            onClick={() => setScreen("book")}>
            {t("tabRequest")}
          </button>
          <button className={`screen-tab${screen === "track" ? " active" : ""}`}
            onClick={() => setScreen("track")}>
            {t("tabTrack")}
          </button>
        </nav>
      )}

      {/* ── Screens ─────────────────────────────────────────────────── */}
      {screen === "book"    && (
        <BookingForm lang={lang} t={t} onBooked={b => { setConfirmed(b); setScreen("confirm"); }} />
      )}
      {screen === "confirm" && (
        <BookingConfirm lang={lang} t={tObj} booking={confirmed}
          onTrack={() => setScreen("track")}
          onNew={() => setScreen("book")} />
      )}
      {screen === "track" && (
        <StatusTracker lang={lang} t={t} tObj={tObj} />
      )}

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="portal-footer">
        <div>© {new Date().getFullYear()} Accuracy Plus Medical Laboratory</div>
        <div style={{ marginTop: 4, opacity: 0.65 }}>Licensed · DHA Accredited · ISO Certified</div>
      </footer>
    </div>
  );
}
