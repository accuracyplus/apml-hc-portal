// views/BookingConfirm.jsx
// Post-submission confirmation screen.
// Shows booking reference, WhatsApp tap-to-notify link, and track button.

import { useState } from "react";

const WA_NUMBER = "971542346392";

function buildWaMessage(booking, lang) {
  if (lang === "ar") {
    return `مرحباً APML،\n\nطلب جمع عينة منزلي\nالاسم: ${booking.patient_name}\nالجوال: ${booking.contact}\nالمرجع: ${booking.id}\nالتاريخ: ${booking.preferred_date} · ${booking.time_slot}\nالمنطقة: ${booking.area}`;
  }
  return `Hello APML,\n\nHome Collection Request\nName: ${booking.patient_name}\nMobile: ${booking.contact}\nReference: ${booking.id}\nDate: ${booking.preferred_date} · ${booking.time_slot}\nArea: ${booking.area}${booking.tests_required ? `\nTests: ${booking.tests_required}` : ""}`;
}

export default function BookingConfirm({ t, lang, booking, onTrack, onNewBooking }) {
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard?.writeText(booking.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMsg  = encodeURIComponent(buildWaMessage(booking, lang));
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  return (
    <div className="portal-page anim-slide">

      {/* Success icon */}
      <div style={{ textAlign: "center", padding: "var(--sp-lg) 0 var(--sp-md)" }}>
        <div className="confirm-icon">✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)",
          marginBottom: 8 }}>{t.confirmTitle}</h2>
        <p style={{ fontSize: 14, color: "var(--navy-60)", lineHeight: 1.6,
          maxWidth: 280, margin: "0 auto" }}>
          {t.confirmSub}
        </p>
      </div>

      {/* Reference badge */}
      <div style={{ textAlign: "center", margin: "var(--sp-md) 0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy-60)",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          {t.refLabel}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span className="ref-badge">{booking.id}</span>
          <button onClick={copyRef}
            style={{ padding: "8px 14px", borderRadius: "var(--r-full)",
              border: "1.5px solid var(--sky)", background: "var(--sky-light)",
              color: "var(--sky-dark)", fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--font)" }}>
            {copied ? t.copied : t.copyRef}
          </button>
        </div>
      </div>

      {/* Booking summary card */}
      <div className="p-card" style={{ marginBottom: 20 }}>
        {[
          { label: t.bookingDate, value: `${booking.preferred_date} · ${booking.time_slot}` },
          { label: t.bookingArea, value: booking.area },
          ...(booking.tests_required ? [{ label: t.tests, value: booking.tests_required }] : []),
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between",
            padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--navy-60)", fontWeight: 600 }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp button */}
      <a href={waLink} target="_blank" rel="noreferrer" className="btn-wa"
        style={{ marginBottom: 10 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {t.waBtn}
      </a>
      <p style={{ fontSize: 12, color: "var(--navy-60)", textAlign: "center",
        marginBottom: 20, lineHeight: 1.5 }}>
        {t.waBtnSub}
      </p>

      {/* Track button */}
      <button className="btn-secondary" onClick={onTrack} style={{ marginBottom: 10 }}>
        {t.trackBtn}
      </button>

      {/* New booking */}
      <button className="btn-ghost" onClick={onNewBooking}
        style={{ width: "100%", textAlign: "center" }}>
        {t.newBooking}
      </button>
    </div>
  );
}
