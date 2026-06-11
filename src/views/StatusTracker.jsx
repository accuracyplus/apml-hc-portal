// portal/src/views/StatusTracker.jsx
// Crash fix: pass full strings object to StatusIllustration (it expects t[lang][status])
// Journey card matches screenshots exactly — dark teal card with emoji steps

import { useState } from "react";
import StatusIllustration from "../components/StatusIllustration.jsx";
import strings from "../i18n.js";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

// Step config matching screenshot exactly
const JOURNEY_STEPS = [
  { key: "Requested",    icon: "✓",  emoji: null, sub: "Booking received"       },
  { key: "Confirmed",    icon: "✓",  emoji: null, sub: "Appointment confirmed"   },
  { key: "Assigned",     icon: "✓",  emoji: null, sub: "Collector assigned"      },
  { key: "On the Way",   icon: "🚗", emoji: "🚗", sub: "Heading to your location"},
  { key: "Collected",    icon: "🧪", emoji: "🧪", sub: "Sample collected"        },
  { key: "Processing",   icon: "🔬", emoji: "🔬", sub: "In the lab"              },
  { key: "Report Ready", icon: "📄", emoji: "📄", sub: "Delivered to you"        },
];

function stepState(current, key) {
  const order = JOURNEY_STEPS.map(s => s.key);
  const ci    = order.indexOf(current);
  const si    = order.indexOf(key);
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

// Status display config
const STATUS_CONFIG = {
  "Requested":    { emoji: "📋", bg: "#EDF3F1", title: "Request Received",        msg: "We've received your booking and will confirm shortly." },
  "Confirmed":    { emoji: "✅", bg: "#DCFCE7", title: "Appointment Confirmed",    msg: "Your appointment is confirmed. We'll be there on time." },
  "Assigned":     { emoji: "👤", bg: "#EDE9FF", title: "Collector Assigned",       msg: "A collector has been assigned to your appointment." },
  "On the Way":   { emoji: "🚗", bg: "#EEF4F3", title: "On the Way",              msg: "Your collector is heading to your location now." },
  "Collected":    { emoji: "🧪", bg: "#CCFBF1", title: "Sample Collected",        msg: "Your sample has been collected and is being processed." },
  "Processing":   { emoji: "🔬", bg: "#DBEAFE", title: "Processing",              msg: "Your sample is being analysed in our laboratory." },
  "Report Ready": { emoji: "📄", bg: "#FEF9C3", title: "Report Ready",            msg: "Your report is ready. Please contact us to access it." },
  "Cancelled":    { emoji: "✕",  bg: "#FEE2E2", title: "Cancelled",               msg: "This booking has been cancelled." },
};

function StatusView({ booking, lang, t, onTrackAnother, onBack, hasMultiple }) {
  const cd     = useCountdown(booking.confirmed_date, booking.confirmed_time);
  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["Requested"];
  const driver = booking.driver || booking.phlebotomist || "";
  const phone  = booking.driver_phone || "";

  const showCountdown = ["Confirmed","Assigned","On the Way"].includes(booking.status)
    && booking.confirmed_date && booking.confirmed_time;
  const showCollector = ["Assigned","On the Way","Collected"].includes(booking.status) && driver;

  return (
    <>
      {/* Back button */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onBack}
          style={{ background: "#EEF4F3", border: "none", borderRadius: 99,
            padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 800,
            color: "var(--teal)", fontFamily: "var(--font)" }}>
          ← Back
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {booking.id}
        </span>
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
            <div className="collector-role">
              {booking.driver ? "Your Driver" : "Your Collector"}
            </div>
          </div>
          {phone && (
            <a href={`tel:${phone}`} className="collector-call">📞</a>
          )}
        </div>
      )}

      {/* Collection Journey card — matches screenshot exactly */}
      <div className="journey-card">
        <div className="journey-card-title">Collection Journey</div>
        <div className="journey-steps">
          {JOURNEY_STEPS.map((step, idx) => {
            const state = stepState(booking.status, step.key);
            const isLast = idx === JOURNEY_STEPS.length - 1;
            return (
              <div key={step.key}
                className={`j-step ${state}`}
                style={{ paddingBottom: isLast ? 0 : 20 }}>
                <div className={`j-dot ${state}`}>
                  {state === "done"
                    ? <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>✓</span>
                    : state === "active"
                    ? <span style={{ fontSize: 20 }}>{step.emoji || step.icon}</span>
                    : <span style={{ fontSize: 18, opacity: 0.5 }}>{step.emoji || "○"}</span>
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

      {/* Reference */}
      <div className="ref-row">
        <span className="ref-row-label">Reference</span>
        <span className="ref-row-value">{booking.id}</span>
      </div>

      {/* Track another */}
      <div style={{ padding: "0 20px 24px" }}>
        <button className="btn-secondary" onClick={onTrackAnother}>
          Track Another Booking
        </button>
      </div>
    </>
  );
}

export default function StatusTracker({ lang, t, tFull }) {
  const [phone,    setPhone]    = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [booking,  setBooking]  = useState(null);
  const [multiple, setMultiple] = useState(null);

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
    if (!p || !n) { setErr("Please enter your mobile number and first name"); return; }
    setLoading(true); setErr(""); setBooking(null); setMultiple(null);
    try {
      const res  = await fetch(
        `${WORKER}/hc-status?phone=${encodeURIComponent(p)}&name=${encodeURIComponent(n)}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr("No booking found. Please check your mobile number and first name.");
      } else if (data.multiple && data.bookings?.length > 1) {
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

  const localPhone = phone.startsWith("971") ? phone.slice(3) : phone;

  const fmtDate = iso => {
    if (!iso) return iso;
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB",
      { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  // ── Single booking detail ──────────────────────────────────────────────
  if (booking) {
    return (
      <div className="portal-page">
        <StatusView
          booking={booking}
          lang={lang}
          t={t}
          hasMultiple={multiple?.length > 1}
          onBack={() => multiple?.length > 1 ? setBooking(null) : reset()}
          onTrackAnother={reset}
        />
      </div>
    );
  }

  // ── Multiple bookings — pick date ──────────────────────────────────────
  if (multiple) {
    return (
      <div className="portal-page">
        <div className="track-hero">
          <div className="track-title">Select Appointment</div>
          <div className="track-subtitle">Multiple bookings found — select a date:</div>
        </div>
        <div style={{ padding: "0 20px" }}>
          {multiple.map(b => (
            <button key={b.id} onClick={() => setBooking(b)}
              style={{ width: "100%", marginBottom: 10, padding: "16px 18px",
                background: "#EEF4F3", border: "1.5px solid var(--border)",
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
          <button className="btn-secondary" onClick={reset} style={{ marginTop: 4 }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Search form ────────────────────────────────────────────────────────
  return (
    <div className="portal-page">
      <div className="track-hero">
        <div className="track-title">Track Your Appointment</div>
        <div className="track-subtitle">Live status of your home visit.</div>

        <div className="track-card">
          {/* Phone input */}
          <div className="phone-wrap">
            <div className="phone-code">+971</div>
            <input className="phone-number" type="tel"
              value={localPhone} placeholder="50 123 4567"
              onChange={e => { setPhone(e.target.value); setErr(""); }} />
          </div>

          {/* Name input */}
          <input className="field-input" value={name}
            placeholder="First name"
            onChange={e => { setName(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && track()}
            style={{ margin: 0 }} />

          {err && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA",
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
