// App.jsx — Accuracy Plus Home Collection
// Logo: upload your 480×150 banner as portal/public/logo.png

import { useState } from "react";
import BookingForm   from "./views/BookingForm.jsx";
import StatusTracker from "./views/StatusTracker.jsx";
import strings       from "./i18n.js";

export default function App() {
  const [lang,      setLang]     = useState("en");
  const [screen,    setScreen]   = useState("book");
  // After submit, store booking so Track tab can pre-load status immediately
  const [liveBooking, setLiveBooking] = useState(null);

  const t     = key => strings[lang]?.[key] ?? strings.en?.[key] ?? key;
  const tFull = strings;
  const isRtl = lang === "ar";

  // Called by BookingForm on successful submit — jump straight to status view
  const handleBooked = (booking) => {
    setLiveBooking(booking);
    setScreen("track");
  };

  // When user manually taps the Track tab, clear any pre-loaded booking
  const handleTabTrack = () => {
    setLiveBooking(null);
    setScreen("track");
  };

  const handleTabBook = () => {
    setLiveBooking(null);
    setScreen("book");
  };

  return (
    <div className={"portal-shell" + (isRtl ? " rtl" : "")}>

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <header className="portal-header">
        <div className="header-top">

          {/* ── Logo area — lighter frosted pill ─────────────────── */}
          <div style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            borderRadius: 12,
            padding: "6px 10px",
            display: "inline-flex",
            alignItems: "center",
          }}>
            {/* Text fallback */}
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

          {/* ── Language toggle ───────────────────────────────────── */}
          <div className="lang-toggle">
            {["en", "ar"].map(l => (
              <button
                key={l}
                className={"lang-btn" + (lang === l ? " active" : "")}
                onClick={() => setLang(l)}>
                {l === "en" ? "EN" : "عربي"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Badge + tagline ──────────────────────────────────────── */}
        <div className="header-badge-row">
          <span className="hc-badge">Home Collection</span>
          <span className="hc-tagline">Bringing Healthcare Closer to You…</span>
        </div>
      </header>

      {/* ══ TABS ════════════════════════════════════════════════════ */}
      <div className="screen-tabs">
        <button
          className={"screen-tab" + (screen === "book" ? " active" : "")}
          onClick={handleTabBook}>
          {t("tabRequest")}
        </button>
        <button
          className={"screen-tab" + (screen === "track" ? " active" : "")}
          onClick={handleTabTrack}>
          {t("tabTrack")}
        </button>
      </div>

      {/* ══ SCREENS ═════════════════════════════════════════════════ */}
      {screen === "book" && (
        <BookingForm
          lang={lang}
          t={t}
          onBooked={handleBooked}
        />
      )}

      {screen === "track" && (
        <StatusTracker
          lang={lang}
          t={t}
          tFull={tFull}
          // Pass live booking directly — no re-fetch needed after submit
          directBooking={liveBooking}
        />
      )}

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer className="portal-footer">
        © {new Date().getFullYear()} Accuracy Plus Medical Laboratory · DHA Licensed
      </footer>
    </div>
  );
}
