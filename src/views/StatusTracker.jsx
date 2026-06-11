// portal/src/views/StatusTracker.jsx
// Fix: StatusIllustration expects translations OBJECT (tObj), not function (t)

import { useState } from "react";
import StatusIllustration from "../components/StatusIllustration.jsx";
import strings from "../i18n.js";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

const JOURNEY = [
  { key: "Requested",    icon: "📋" },
  { key: "Confirmed",    icon: "✅" },
  { key: "Assigned",     icon: "👤" },
  { key: "On the Way",   icon: "🚗" },
  { key: "Collected",    icon: "🧪" },
  { key: "Processing",   icon: "🔬" },
  { key: "Report Ready", icon: "📄" },
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

function pad(n) { return String(n).padStart(2, "0"); }

function useCountdown(dateStr, timeStr) {
  const [now, setNow] = useState(Date.now());
  useState(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  });
  if (!dateStr || !timeStr) return null;
  if (!/^\d{1,2}:\d{2}/.test(timeStr)) return null;
  const target = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(target.getTime())) return null;
  const diff = target - now;
  if (diff <= 0) return { h: 0, m: 0, s: 0, past: true };
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    past: false,
  };
}

function Countdown({ date, time, lang }) {
  const cd = useCountdown(date, time);
  if (!cd) return null;
  return (
    <div className="countdown-wrap">
      <div className="countdown-label">
        {cd.past
          ? (lang === "ar" ? "في الطريق إليك" : "On the way to you")
          : (lang === "ar" ? "الوقت المتبقي" : "Arriving in approximately")}
      </div>
      {!cd.past
        ? <div className="countdown-time">{pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)}</div>
        : <div className="countdown-time" style={{ fontSize: 28 }}>🚗 On the way!</div>
      }
      <div className="countdown-sub">{date} at {time}</div>
    </div>
  );
}

function DriverCard({ booking, lang }) {
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
        {phone && <a href={`tel:${phone}`} className="phleb-phone">📞 {phone}</a>}
      </div>
    </div>
  );
}

function BookingDetail({ booking, lang, t, tObj, onBack, onTrackAnother }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 0" }}>
        <button onClick={onBack}
          style={{ background: "var(--sky-light)", border: "none", borderRadius: 8,
            padding: "7px 14px", cursor: "pointer", fontSize: 12,
            fontWeight: 800, color: "var(--sky-dark)", fontFamily: "var(--font)" }}>
          ← {t("back") || "Back"}
        </button>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {booking.id} · {booking.date}
        </span>
      </div>

      {/* StatusIllustration gets tObj (plain object), not t function */}
      <StatusIllustration status={booking.status} lang={lang} t={tObj} />

      {["Confirmed","Assigned","On the Way"].includes(booking.status) &&
        booking.confirmed_date && booking.confirmed_time && (
        <Countdown date={booking.confirmed_date} time={booking.confirmed_time} lang={lang} />
      )}

      {["Confirmed","Assigned","On the Way"].includes(booking.status) && (
        <DriverCard booking={booking} lang={lang} />
      )}

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

      <div style={{ textAlign: "center", marginBottom: 16, padding: "0 16px" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
          {t("reference") || "Booking Reference"}
        </div>
        <div className="ref-badge">{booking.id}</div>
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <button className="btn-secondary" onClick={onTrackAnother}>
          {t("trackAnother") || "Track Another Booking"}
        </button>
      </div>
    </>
  );
}

export default function StatusTracker({ lang, t, tObj: tObjProp }) {
  // tObj for StatusIllustration (needs plain object, not function)
  const tObj = tObjProp ?? strings[lang] ?? strings.en;

  const [phone,    setPhone]    = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [booking,  setBooking]  = useState(null);
  const [multiple, setMultiple] = useState(null);

  const isRtl = lang === "ar";

  const normalizePhone = raw => {
    const digits = raw.trim().replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("971")) return digits;
    if (digits.startsWith("0"))   return "971" + digits.slice(1);
    return "971" + digits;
  };

  const track = async () => {
    const p = normalizePhone(phone);
    const n = name.trim().split(" ")[0].toLowerCase();
    if (!p || !n) { setErr(t("trackRequired") || "Enter your mobile and first name"); return; }
    setLoading(true); setErr(""); setBooking(null); setMultiple(null);
    try {
      const res  = await fetch(
        `${WORKER}/hc-status?phone=${encodeURIComponent(p)}&name=${encodeURIComponent(n)}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(t("notFound") || "No booking found. Check your mobile and first name.");
      } else if (data.multiple && data.bookings?.length > 1) {
        setMultiple(data.bookings);
      } else {
        setBooking(data.booking || data.bookings?.[0]);
      }
    } catch {
      setErr(t("networkError") || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setBooking(null); setMultiple(null); setErr(""); };

  const fmtDate = iso => {
    if (!iso) return iso;
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB",
      { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={`portal-page${isRtl ? " rtl" : " ltr"}`}>
      <div className="portal-hero">
        <h1>{t("trackTitle")}</h1>
        <p>{t("trackSubtitle")}</p>
      </div>

      {/* Search form */}
      {!booking && !multiple && (
        <div style={{ padding: "16px 16px 0" }}>
          <div className="p-card">
            <div className="field-group">
              <label className="field-label">{t("mobile")} *</label>
              <div className="phone-input-wrap">
                <div className="phone-prefix">🇦🇪 +971</div>
                <input className="field-input phone-input-field"
                  type="tel"
                  value={phone.replace(/^971/, "")}
                  placeholder="5X XXX XXXX"
                  onChange={e => { setPhone(e.target.value); setErr(""); }} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">{t("firstName")} *</label>
              <input className="field-input" value={name}
                placeholder={t("firstNamePh") || "Your first name"}
                onChange={e => { setName(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && track()} />
            </div>
            {err && <div className="error-msg">{err}</div>}
            <button className="btn-primary" onClick={track} disabled={loading}>
              {loading ? (t("searching") || "Searching…") : (t("track") || "Track Appointment")}
            </button>
          </div>
        </div>
      )}

      {/* Multiple bookings */}
      {multiple && !booking && (
        <div style={{ padding: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>
            {t("multipleFound") || "Multiple bookings found"}
          </div>
          <div style={{ fontSize: 13, color: "var(--navy-60)", marginBottom: 16 }}>
            {t("selectDate") || "Select a date to view status:"}
          </div>
          {multiple.map(b => (
            <button key={b.id} onClick={() => setBooking(b)}
              style={{ width: "100%", marginBottom: 10, padding: "14px 16px",
                background: "#fff", border: "1.5px solid var(--border)",
                borderRadius: 14, cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font)",
                boxShadow: "0 2px 8px rgba(14,165,233,0.08)" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--navy)", marginBottom: 4 }}>
                {fmtDate(b.date)}
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--navy-60)" }}>
                <span>{b.time_slot}</span>
                <span>📍 {b.area}</span>
                <span style={{ background: "var(--sky-light)", color: "var(--sky-dark)",
                  padding: "1px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {b.status}
                </span>
              </div>
            </button>
          ))}
          <button className="btn-secondary" onClick={reset} style={{ marginTop: 4 }}>
            {t("back") || "Back"}
          </button>
        </div>
      )}

      {/* Single booking detail */}
      {booking && (
        <BookingDetail
          booking={booking}
          lang={lang}
          t={t}
          tObj={tObj}
          onBack={() => multiple?.length > 1 ? setBooking(null) : reset()}
          onTrackAnother={reset}
        />
      )}
    </div>
  );
}
