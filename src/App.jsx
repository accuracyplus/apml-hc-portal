// App.jsx — Accuracy Plus Home Collection portal
// Premium, easy-to-use design. Logo banner + tagline + two clean screens.

import { useState } from "react";
import BookingForm    from "./views/BookingForm.jsx";
import BookingConfirm from "./views/BookingConfirm.jsx";
import StatusTracker  from "./views/StatusTracker.jsx";
import { t as translate } from "./i18n.js";

export default function App() {
  const [lang,       setLang]    = useState("en");
  const [screen,     setScreen]  = useState("book");  // book | confirm | track
  const [confirmed,  setConfirmed] = useState(null);

  const t = key => translate(key, lang);
  const isRtl = lang === "ar";

  const handleBooked = booking => {
    setConfirmed(booking);
    setScreen("confirm");
  };

  return (
    <div className={`portal-shell${isRtl ? " rtl" : ""}`}>

      {/* ── Brand header ──────────────────────────────────────────────── */}
      <header className="portal-header">
        <div className="brand-block">
          {/* Logo banner — upload logo.png (480×150) to portal/public/ */}
          <img
            src="/logo.png"
            alt="Accuracy Plus Home Collection"
            className="portal-logo-banner"
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          {/* Fallback text brand if logo hasn't been uploaded yet */}
          <div className="brand-text-fallback" style={{ display: "none" }}>
            <div className="brand-name">Accuracy Plus</div>
            <div className="brand-sub">Home Collection</div>
          </div>
          <div className="brand-tagline">
            Bringing Healthcare Closer to You&hellip;
          </div>
        </div>

        {/* Language toggle */}
        <div className="lang-toggle" role="group" aria-label="Language">
          {["en","ar"].map(l => (
            <button key={l} className={`lang-btn${lang === l ? " active" : ""}`}
              onClick={() => setLang(l)}>
              {l === "en" ? "EN" : "عربي"}
            </button>
          ))}
        </div>
      </header>

      {/* ── Screen tabs ───────────────────────────────────────────────── */}
      {screen !== "confirm" && (
        <nav className="screen-tabs" role="tablist">
          <button role="tab" aria-selected={screen === "book"}
            className={`screen-tab${screen === "book" ? " active" : ""}`}
            onClick={() => setScreen("book")}>
            {t("tabRequest")}
          </button>
          <button role="tab" aria-selected={screen === "track"}
            className={`screen-tab${screen === "track" ? " active" : ""}`}
            onClick={() => setScreen("track")}>
            {t("tabTrack")}
          </button>
        </nav>
      )}

      {/* ── Screens ───────────────────────────────────────────────────── */}
      {screen === "book"    && <BookingForm    lang={lang} t={t} onBooked={handleBooked} />}
      {screen === "confirm" && <BookingConfirm lang={lang} t={t} booking={confirmed}
                                  onTrack={() => setScreen("track")}
                                  onNew={() => setScreen("book")} />}
      {screen === "track"   && <StatusTracker  lang={lang} t={t} />}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="portal-footer">
        <div>© {new Date().getFullYear()} Accuracy Plus Medical Laboratory</div>
        <div style={{ marginTop: 4, opacity: 0.65 }}>
          Licensed · DHA Accredited · ISO Certified
        </div>
      </footer>
    </div>
  );
}
