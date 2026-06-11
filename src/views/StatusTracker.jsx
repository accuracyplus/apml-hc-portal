// portal/src/views/StatusTracker.jsx — DOB tracking, editable code, crash fixed
import { useState } from "react";
import strings from "../i18n.js";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

const JOURNEY_STEPS = [
  { key: "Requested",    icon: "📋", sub: "Booking received"        },
  { key: "Confirmed",    icon: "✅", sub: "Appointment confirmed"    },
  { key: "Assigned",     icon: "👤", sub: "Collector assigned"       },
  { key: "On the Way",   icon: "🚗", sub: "Heading to your location" },
  { key: "Collected",    icon: "🧪", sub: "Sample collected"         },
  { key: "Processing",   icon: "🔬", sub: "In the lab"               },
  { key: "Report Ready", icon: "📄", sub: "Delivered to you"         },
];

const STATUS_CONFIG = {
  "Requested":    { emoji: "📋", bg: "#EDF3F1", title: "Request Received",      msg: "We've received your booking and will confirm shortly."          },
  "Confirmed":    { emoji: "✅", bg: "#DCFCE7", title: "Appointment Confirmed",  msg: "Your appointment is confirmed. We'll be there on time."         },
  "Assigned":     { emoji: "👤", bg: "#EDE9FF", title: "Collector Assigned",     msg: "A collector has been assigned to your appointment."            },
  "On the Way":   { emoji: "🚗", bg: "#D6EEEB", title: "On the Way",            msg: "Your collector is heading to your location now."               },
  "Collected":    { emoji: "🧪", bg: "#CCFBF1", title: "Sample Collected",      msg: "Your sample has been collected and is being analysed."         },
  "Processing":   { emoji: "🔬", bg: "#DBEAFE", title: "Processing",            msg: "Your sample is being analysed in our laboratory."              },
  "Report Ready": { emoji: "📄", bg: "#FEF9C3", title: "Report Ready",          msg: "Your report is ready. Please contact us to access it."         },
  "Cancelled":    { emoji: "✕",  bg: "#FEE2E2", title: "Cancelled",             msg: "This booking has been cancelled."                              },
};

function stepState(current, key) {
  const order = JOURNEY_STEPS.map(s => s.key);
  const ci = order.indexOf(current);
  const si = order.indexOf(key);
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
  if (!dateStr || !timeStr || !/^\d{1,2}:\d{2}/.test(timeStr)) return null;
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

function StatusView({ booking, onBack, onTrackAnother, hasMultiple }) {
  const cd     = useCountdown(booking.confirmed_date, booking.confirmed_time);
  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["Requested"];
  const driver = booking.driver || booking.phlebotomist || "";
  const phone  = booking.driver_phone || "";

  const showCountdown = ["Confirmed","Assigned","On the Way"].includes(booking.status)
    && booking.confirmed_date && booking.confirmed_time;
  const showCollector = ["Assigned","On the Way","Collected"].includes(booking.status) && driver;

  return (
    <div className="portal-page">
      {/* Back */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onBack}
          style={{ background: "rgba(60,120,113,0.10)", border: "none",
            borderRadius: 99, padding: "6px 14px", cursor: "pointer",
            fontSize: 12, fontWeight: 800, color: "var(--teal)",
            fontFamily: "var(--font)" }}>
          ← Back
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{booking.id}</span>
      </div>

      {/* Status illustration */}
      <div className="status-illus">
        <div className="illus-circle" style={{ background: config.bg }}>
          {config.emoji}
        </div>
        <div className="status-title">{config.title}</div>
        <div className="status-msg">{config.msg}</div>
      </div>

      {/* Countdown */}
      {showCountdown && (
        <div className="countdown-card">
          <div className="countdown-label">Arriving in approximately</div>
          {!cd?.past
            ? <div className="countdown-time">
                {pad(cd?.h ?? 0)}:{pad(cd?.m ?? 0)}:{pad(cd?.s ?? 0)}
              </div>
            : <div className="countdown-time" style={{ fontSize: 28 }}>🚗 On the way!</div>
          }
        </div>
      )}

      {/* Collector card */}
      {showCollector && (
        <div className="collector-card">
          <div className="collector-avatar">👤</div>
          <div className="collector-info">
            <div className="collector-name">{driver}</div>
            <div className="collector-role">{booking.driver ? "Your Driver" : "Your Collector"}</div>
          </div>
          {phone && <a href={`tel:${phone}`} className="collector-call">📞</a>}
        </div>
      )}

      {/* Journey card */}
      <div className="journey-card">
        <div className="journey-card-title">Collection Journey</div>
        <div className="journey-steps">
          {JOURNEY_STEPS.map((step, idx) => {
            const state = stepState(booking.status, step.key);
            return (
              <div key={step.key} className={`j-step ${state}`}
                style={{ paddingBottom: idx < JOURNEY_STEPS.length - 1 ? 24 : 0 }}>
                <div className={`j-dot ${state}`}>
                  {state === "done"
                    ? <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>✓</span>
                    : <span style={{ fontSize: 20 }}>{step.icon}</span>
                  }
                </div>
                <div className="j-info">
                  <div className="j-label">{step.key}</div>
                  <div className="j-sub">{step.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ref-row">
        <span className="ref-row-label">Reference</span>
        <span className="ref-row-value">{booking.id}</span>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <button className="btn-secondary" onClick={onTrackAnother}>
          Track Another Booking
        </button>
      </div>
    </div>
  );
}

export default function StatusTracker({ lang, t, tFull: _tFull }) {
  const [code,     setCode]     = useState("971");
  const [phone,    setPhone]    = useState("");
  const [name,     setName]     = useState("");
  const [dob,      setDob]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [booking,  setBooking]  = useState(null);
  const [multiple, setMultiple] = useState(null);

  const normalizePhone = (c, n) => {
    const code   = String(c || "971").replace(/\D/g, "");
    const number = String(n || "").replace(/\D/g, "");
    if (!number) return "";
    return code + number;
  };

  const track = async () => {
    const p = normalizePhone(code, phone);
    const n = name.trim().split(" ")[0].toLowerCase();
    if (!p || !n) { setErr("Please enter your mobile number and first name"); return; }
    setLoading(true); setErr(""); setBooking(null); setMultiple(null);
    try {
      const params = new URLSearchParams({ phone: p, name: n });
      if (dob) params.set("dob", dob);
      const res  = await fetch(`${WORKER}/hc-status?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErr("No booking found. Please check your details.");
      } else if (data.multiple && data.bookings?.length > 1) {
        // Client-side DOB filter if multiple results
        if (dob) {
          const filtered = data.bookings.filter(b => b.dob === dob || !b.dob);
          if (filtered.length === 1) { setBooking(filtered[0]); return; }
        }
        setMultiple(data.bookings);
      } else {
        setBooking(data.booking || data.bookings?.[0]);
      }
    } catch {
      setErr("Network error. Please try again.");
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

  /* ── Single booking ──────────────────────────────────────────────── */
  if (booking) {
    return (
      <StatusView
        booking={booking}
        hasMultiple={multiple?.length > 1}
        onBack={() => multiple?.length > 1 ? setBooking(null) : reset()}
        onTrackAnother={reset}
      />
    );
  }

  /* ── Multiple — pick date ────────────────────────────────────────── */
  if (multiple) {
    return (
      <div className="portal-page">
        <div className="track-hero">
          <div className="track-title">Select Appointment</div>
          <div className="track-subtitle">Multiple bookings found — select a date:</div>
          {multiple.map(b => (
            <button key={b.id} onClick={() => setBooking(b)}
              style={{ width: "100%", marginBottom: 10, padding: "16px 18px",
                background: "rgba(255,255,255,0.70)", backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(60,120,113,0.15)",
                borderRadius: 16, cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font)" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                {fmtDate(b.date)}
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--text-muted)" }}>
                <span>{b.time_slot}</span>
                <span style={{ background: "var(--teal)", color: "#fff",
                  padding: "1px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {b.status}
                </span>
              </div>
            </button>
          ))}
          <button className="btn-secondary" onClick={reset}>Back</button>
        </div>
      </div>
    );
  }

  /* ── Search form ─────────────────────────────────────────────────── */
  return (
    <div className="portal-page">
      <div className="track-hero">
        <div className="track-title">Track Your Appointment</div>
        <div className="track-subtitle">Live status of your home visit.</div>

        <div className="track-card">
          {/* Mobile — editable code */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "var(--teal-600)",
              textTransform: "uppercase", letterSpacing: "0.09em", display: "block",
              marginBottom: 6 }}>
              Mobile Number
            </label>
            <div className="phone-wrap">
              <input
                className="phone-code-input"
                type="tel" value={code} maxLength={4}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                title="Country code" />
              <input className="phone-number" type="tel"
                value={phone} placeholder="50 123 4567"
                onChange={e => { setPhone(e.target.value.replace(/\D/g,"")); setErr(""); }} />
            </div>
          </div>

          {/* First name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "var(--teal-600)",
              textTransform: "uppercase", letterSpacing: "0.09em", display: "block",
              marginBottom: 6 }}>
              First Name
            </label>
            <input className="field-input" value={name}
              placeholder="Your first name"
              onChange={e => { setName(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && track()}
              style={{ margin: 0, background: "rgba(255,255,255,0.80)" }} />
          </div>

          {/* Date of birth */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "var(--teal-600)",
              textTransform: "uppercase", letterSpacing: "0.09em", display: "block",
              marginBottom: 6 }}>
              Date of Birth <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", textTransform: "none" }}>· optional, helps narrow results</span>
            </label>
            <input className="field-input" type="date" value={dob}
              onChange={e => { setDob(e.target.value); setErr(""); }}
              style={{ margin: 0, background: "rgba(255,255,255,0.80)" }} />
          </div>

          {err && (
            <div style={{ background: "rgba(254,242,242,0.90)", border: "1px solid #FECACA",
              color: "#DC2626", fontSize: 13, fontWeight: 700,
              padding: "10px 14px", borderRadius: 12 }}>
              {err}
            </div>
          )}

          <button className="btn-primary" onClick={track} disabled={loading}
            style={{ margin: 0 }}>
            {loading ? "Searching…" : "Track Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
