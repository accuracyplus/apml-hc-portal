// App.jsx — Root component. Manages language + screen state.
// Screens: "book" | "confirm" (post-booking) | "track"

import { useState } from "react";
import { T } from "./i18n.js";
import BookingForm    from "../views/BookingForm.jsx";
import BookingConfirm from "../views/BookingConfirm.jsx";
import StatusTracker  from "../views/StatusTracker.jsx";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";
export { WORKER };

export default function App() {
  const [lang,    setLang]    = useState("en");
  const [screen,  setScreen]  = useState("book"); // "book" | "confirm" | "track"
  const [booking, setBooking] = useState(null);   // confirmed booking data

  const t   = T[lang];
  const dir = t.dir;

  const goConfirm = (data) => { setBooking(data); setScreen("confirm"); };
  const goTrack   = ()     => setScreen("track");
  const goBook    = ()     => { setBooking(null); setScreen("book"); };

  return (
    <div className={`portal-shell ${dir === "rtl" ? "rtl" : "ltr"}`} dir={dir}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="portal-header">
        <img src="/apml-logo-banner.png" alt="APML"
          className="portal-logo"
          onError={e => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        {/* Fallback logo if image missing */}
        <div style={{ display:"none", alignItems:"center", gap:6 }}>
          <div style={{ width:32, height:32, borderRadius:8,
            background:"linear-gradient(135deg,#1B2B4B,#0EA5E9)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontWeight:900, fontSize:13 }}>A+</div>
          <span style={{ fontWeight:800, fontSize:14, color:"#1B2B4B" }}>APML</span>
        </div>

        {/* Language toggle */}
        <div className="lang-toggle" role="group" aria-label="Language">
          <button className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}>EN</button>
          <button className={`lang-btn ${lang === "ar" ? "active" : ""}`}
            onClick={() => setLang("ar")}>عر</button>
        </div>
      </header>

      {/* ── Screen tabs (Book / Track) — hide on confirm screen ─────── */}
      {screen !== "confirm" && (
        <nav className="screen-tabs">
          <button className={`screen-tab ${screen === "book" ? "active" : ""}`}
            onClick={goBook}>
            {t.bookTab}
          </button>
          <button className={`screen-tab ${screen === "track" ? "active" : ""}`}
            onClick={goTrack}>
            {t.trackTab}
          </button>
        </nav>
      )}

      {/* ── Screens ────────────────────────────────────────────────── */}
      {screen === "book"    && <BookingForm    t={t} lang={lang} onConfirm={goConfirm} />}
      {screen === "confirm" && <BookingConfirm t={t} lang={lang} booking={booking} onTrack={goTrack} onNewBooking={goBook} />}
      {screen === "track"   && <StatusTracker  t={t} lang={lang} initialBooking={booking} />}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="portal-footer">{t.footer}</footer>
    </div>
  );
}
