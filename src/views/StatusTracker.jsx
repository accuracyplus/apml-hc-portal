// portal/src/views/StatusTracker.jsx
// Shows driver name + phone (not phlebotomist phone).
// Countdown fixed — handles HH:MM strings correctly.

import { useState } from "react";
import { StatusIllustration } from "../components/StatusIllustration.jsx";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

const JOURNEY = [
  { key: "Requested",   icon: "📋" },
  { key: "Confirmed",   icon: "✅" },
  { key: "Assigned",    icon: "👤" },
  { key: "On the Way",  icon: "🚗" },
  { key: "Collected",   icon: "🧪" },
  { key: "Processing",  icon: "🔬" },
  { key: "Report Ready",icon: "📄" },
];

function stepState(current, stepKey) {
  const order = JOURNEY.map(j => j.key);
  const ci = order.indexOf(current);
  const si = order.indexOf(stepKey);
  if (ci === -1) return "future";
  if (si < ci)   return "done";
  if (si === ci) return "active";
  return "future";
}

// Build countdown — expects "HH:MM" string from server (already converted by worker)
function useCountdown(dateStr, timeStr) {
  const [now, setNow] = useState(Date.now());
  useState(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  });

  if (!dateStr || !timeStr) return null;
  // Validate HH:MM format — if it looks like a decimal skip
  if (!/^\d{1,2}:\d{2}/.test(timeStr)) return null;

  const target = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(target.getTime())) return null;

  const diff = target - now;
  if (diff <= 0) return { h: 0, m: 0, s: 0, past: true };

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s, past: false };
}

function pad(n) { return String(n).padStart(2, "0"); }

function Countdown({ date, time, lang }) {
  const cd = useCountdown(date, time);
  if (!cd) return null;

  return (
    <div className="countdown-wrap">
      <div className="countdown-label">
        {cd.past
          ? (lang === "ar" ? "في الطريق إليك" : "Your phlebotomist is arriving")
          : (lang === "ar" ? "الوقت المتبقي" : "Arriving in approximately")}
      </div>
      {!cd.past ? (
        <div className="countdown-time">
          {pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)}
        </div>
      ) : (
        <div className="countdown-time" style={{ fontSize: 28 }}>🚗 On the way!</div>
      )}
      <div className="countdown-sub">
        {lang === "ar"
          ? `${date} الساعة ${time}`
          : `Scheduled ${date} at ${time}`}
      </div>
    </div>
  );
}

function DriverCard({ booking, lang }) {
  // Show driver if available, otherwise phlebotomist
  const name  = booking.driver || booking.phlebotomist || "";
  const phone = booking.driver_phone || "";
  const label = booking.driver
    ? (lang === "ar" ? "السائق" : "Your Driver")
    : (lang === "ar" ? "أخصائي السحب" : "Your Phlebotomist");

  if (!name) return null;

  return (
    <div className="phlebotomist-card">
      <div className="phleb-avatar">👤</div>
      <div style={{ flex: 1 }}>
        <div className="phleb-name">{name}</div>
        <div className="phleb-role">{label}</div>
        {phone && (
          <a href={`tel:${phone}`} className="phleb-phone">
            📞 {phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function StatusTracker({ lang, t }) {
  const [phone,   setPhone]   = useState("");
  const [name,    setName]    = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [searched,setSearched]= useState(false);

  const track = async () => {
    const trimPhone = phone.trim().replace(/\s/g, "");
    const trimName  = name.trim().split(" ")[0];
    if (!trimPhone || !trimName) {
      setErr(t("trackRequired") || "Enter your mobile number and first name");
      return;
    }
    setLoading(true);
    setErr("");
    setBooking(null);
    try {
      const res  = await fetch(
        `${WORKER}/hc-status?phone=${encodeURIComponent(trimPhone)}&name=${encodeURIComponent(trimName.toLowerCase())}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(t("notFound") || "No booking found. Check your mobile number and name.");
      } else {
        setBooking(data.booking);
      }
    } catch {
      setErr(t("networkError") || "Network error. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const isRtl = lang === "ar";

  return (
    <div className={`portal-page${isRtl ? " rtl" : " ltr"}`}>
      {/* Hero */}
      <div className="portal-hero">
        <h1>{t("trackTitle")}</h1>
        <p>{t("trackSubtitle")}</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Search form */}
        {!booking && (
          <div className="p-card">
            <div className="field-group">
              <label className="field-label">{t("mobile")} *</label>
              <input className="field-input" type="tel" value={phone}
                placeholder="05X XXX XXXX"
                onChange={e => { setPhone(e.target.value); setErr(""); }} />
            </div>
            <div className="field-group">
              <label className="field-label">{t("firstName")} *</label>
              <input className="field-input" value={name}
                placeholder={t("firstNamePh") || "Your first name"}
                onChange={e => { setName(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && track()} />
            </div>
            {err && <div className="error-msg">{err}</div>}
            {searched && !booking && !err && !loading && (
              <div className="error-msg">{t("notFound") || "No booking found."}</div>
            )}
            <button className="btn-primary" onClick={track} disabled={loading}>
              {loading ? t("searching") || "Searching…" : t("track") || "Track Booking"}
            </button>
          </div>
        )}

        {/* Booking found */}
        {booking && (
          <>
            <StatusIllustration status={booking.status} lang={lang} t={t} />

            {/* Countdown — shown when assigned or on the way */}
            {["Assigned", "On the Way"].includes(booking.status) &&
              booking.confirmed_date && booking.confirmed_time && (
              <Countdown
                date={booking.confirmed_date}
                time={booking.confirmed_time}
                lang={lang}
              />
            )}

            {/* Driver/phlebotomist card */}
            {["Assigned", "On the Way", "Confirmed"].includes(booking.status) && (
              <DriverCard booking={booking} lang={lang} />
            )}

            {/* Journey stepper */}
            <div className="journey">
              {JOURNEY.map(step => {
                const state = stepState(booking.status, step.key);
                return (
                  <div key={step.key} className={`journey-step ${state}`}>
                    <div className="step-dot">{state === "done" ? "✓" : step.icon}</div>
                    <div className="step-info">
                      <div className="step-label">{t(step.key) || step.key}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Booking reference */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                {t("reference") || "Booking reference"}
              </div>
              <div className="ref-badge">{booking.id}</div>
            </div>

            {/* Track another */}
            <button className="btn-secondary" onClick={() => { setBooking(null); setSearched(false); }}>
              {t("trackAnother") || "Track another booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
