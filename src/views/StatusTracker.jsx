// views/StatusTracker.jsx
// Patient status tracking — phone + name lookup → full journey display.

import { useState, useEffect, useRef } from "react";
import { WORKER } from "../App.jsx";
import { STATUS_ORDER, STATUS_BG } from "../i18n.js";
import StatusIllustration from "../src/components/StatusIllustration.jsx";

const APML_PHONE = "tel:+97124XXXXXX"; // replace with APML lab number

// ── Live countdown ────────────────────────────────────────────────────────────
function Countdown({ date, time, t }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!date || !time) return;

    const update = () => {
      const target = new Date(`${date}T${time}:00`);
      const diff   = target - Date.now();
      if (diff <= 0) { setDisplay(t.anytimeNow); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setDisplay(
        `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
      );
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date, time, t]);

  if (!display) return null;

  return (
    <div className="countdown-wrap">
      <div className="countdown-label">{t.arrivingIn}</div>
      <div className="countdown-time">{display}</div>
      {date && <div className="countdown-sub">{date} · {time?.slice(0,5)}</div>}
    </div>
  );
}

// ── Phlebotomist card ─────────────────────────────────────────────────────────
function PhlebotomistCard({ name, phone, t }) {
  if (!name) return null;
  // Initials for avatar
  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="phlebotomist-card">
      <div className="phleb-avatar">{initials}</div>
      <div style={{ flex: 1 }}>
        <div className="phleb-role">{t.phlebTitle}</div>
        <div className="phleb-name">{name}</div>
        {phone && (
          <a href={`tel:${phone}`} className="phleb-phone">
            {t.callPhleb} {phone}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Journey stepper ───────────────────────────────────────────────────────────
function JourneyStepper({ currentStatus, t }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentStatus === "Cancelled") {
    return (
      <div className="journey">
        <div className="journey-step active">
          <div className="step-dot">✕</div>
          <div className="step-info">
            <div className="step-label">{t.statuses["Cancelled"].label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="journey">
      {STATUS_ORDER.map((status, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;
        const cls    = done ? "done" : active ? "active" : "future";
        const label  = t.journey[idx] || status;

        return (
          <div key={status} className={`journey-step ${cls}`}>
            <div className="step-dot">
              {done ? "✓" : idx + 1}
            </div>
            <div className="step-info">
              <div className="step-label">{label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StatusTracker({ t, initialBooking }) {
  const [phone,   setPhone]   = useState(initialBooking?.contact || "");
  const [name,    setName]    = useState(initialBooking?.patient_name?.split(" ")[0] || "");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error,   setError]   = useState("");
  const fetchRef = useRef(false);

  // Auto-track if we came from confirm screen with data
  useEffect(() => {
    if (initialBooking?.contact && initialBooking?.patient_name) {
      doTrack(initialBooking.contact, initialBooking.patient_name.split(" ")[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doTrack = async (p, n) => {
    if (fetchRef.current) return;
    const ph = (p || phone).trim();
    const nm = (n || name).trim();
    if (!ph || !nm) { setError(t.required); return; }

    fetchRef.current = true;
    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const res  = await fetch(
        `${WORKER}/hc-status?phone=${encodeURIComponent(ph)}&name=${encodeURIComponent(nm)}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok || !data.booking) throw new Error(data.error || "not_found");
      setBooking(data.booking);
    } catch (e) {
      setError(e.message === "not_found" ? t.notFound : (e.message || t.notFound));
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  };

  const status   = booking?.status || "";
  const statusDef = t.statuses[status] || t.statuses["Requested"];

  return (
    <div>
      {/* Search form */}
      <div className="portal-page" style={{ paddingBottom: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            {t.trackTitle}
          </div>
          <p style={{ fontSize: 13, color: "var(--navy-60)" }}>{t.trackSub}</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input className="field-input" type="tel"
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder={t.trackMobile}
            style={{ flex: 3 }} />
          <input className="field-input" type="text"
            value={name} onChange={e => setName(e.target.value)}
            placeholder={t.trackName}
            style={{ flex: 2 }} />
        </div>

        <button className="btn-primary" onClick={() => doTrack()}
          disabled={loading}>
          {loading ? t.tracking : t.trackBtn2}
        </button>
      </div>

      {/* ── Result ──────────────────────────────────────────────────── */}
      {booking && (
        <div className="anim-slide">

          {/* Status illustration */}
          <StatusIllustration status={status} t={t} />

          {/* Countdown — shown for On the Way + Assigned if confirmed time exists */}
          {(status === "On the Way" || status === "Assigned") &&
            booking.confirmed_date && booking.confirmed_time && (
            <div style={{ padding: "0 var(--sp-md)" }}>
              <Countdown date={booking.confirmed_date} time={booking.confirmed_time} t={t} />
            </div>
          )}

          {/* Phlebotomist card — shown when Assigned or On the Way */}
          {(status === "Assigned" || status === "On the Way") && booking.phlebotomist && (
            <PhlebotomistCard
              name={booking.phlebotomist}
              phone={booking.phlebotomist_phone}
              t={t}
            />
          )}

          {/* Journey stepper */}
          <div style={{ padding: "var(--sp-sm) 0 0", borderTop: "1px solid var(--border)" }}>
            <div style={{ padding: "12px var(--sp-md) 8px",
              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--navy-60)" }}>
              Status Journey
            </div>
            <JourneyStepper currentStatus={status} t={t} />
          </div>

          {/* Booking detail strip */}
          <div style={{ margin: "0 var(--sp-md) var(--sp-md)" }}
            className="p-card">
            {[
              { label: t.bookingRef,  value: booking.id },
              { label: t.bookingDate, value: `${booking.date} · ${booking.time_slot}` },
              { label: t.bookingArea, value: booking.area },
            ].filter(r => r.value).map(row => (
              <div key={row.label}
                style={{ display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--navy-60)", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Contact us */}
          <div style={{ textAlign: "center", padding: "0 var(--sp-md) var(--sp-lg)" }}>
            <p style={{ fontSize: 12, color: "var(--navy-60)", marginBottom: 10 }}>
              {t.contactUs}
            </p>
            <a href={APML_PHONE} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: "var(--r-full)",
              background: "var(--sky-light)", color: "var(--sky-dark)",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              border: "1.5px solid var(--sky)",
            }}>
              {t.callApml}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
