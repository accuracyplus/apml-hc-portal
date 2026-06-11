// portal/src/views/BookingForm.jsx — matches screenshot design
import { useState } from "react";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const uaeHour = () => {
  const s = new Date().toLocaleString("en-US",
    { timeZone: "Asia/Dubai", hour: "numeric", hour12: false });
  return parseInt(s, 10);
};

// Time slot options as shown in screenshot: "Morning · 8 – 11 ▼"
const TIME_OPTIONS = [
  { value: "Early Morning (6–8 AM)",    label: "Early Morning · 6 – 8",  start: 4  },
  { value: "Morning (8–11 AM)",          label: "Morning · 8 – 11",       start: 6  },
  { value: "Midday (11 AM–2 PM)",        label: "Midday · 11 – 2",        start: 10 },
  { value: "Afternoon (2–5 PM)",         label: "Afternoon · 2 – 5",      start: 13 },
  { value: "Evening (5–8 PM)",           label: "Evening · 5 – 8",        start: 16 },
];

const getAvailableOptions = date => {
  if (date !== todayISO()) return TIME_OPTIONS;
  const h = uaeHour();
  return TIME_OPTIONS.filter(o => o.start > h);
};

const normalizePhone = raw => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("971")) return digits;
  if (digits.startsWith("0"))   return "971" + digits.slice(1);
  return "971" + digits;
};

const blank = () => ({
  patient_name: "", contact: "", dob: "",
  preferred_date: "", time_slot: "",
  tests_required: "", notes: "", location_pin: "",
});

export default function BookingForm({ lang, t, onBooked }) {
  const [form,    setForm]    = useState(blank);
  const [errs,    setErrs]    = useState({});
  const [busy,    setBusy]    = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [locBusy, setLocBusy] = useState(false);
  const isRtl = lang === "ar";

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === "preferred_date") {
        const av = getAvailableOptions(v).map(o => o.value);
        if (next.time_slot && !av.includes(next.time_slot)) next.time_slot = "";
      }
      return next;
    });
    setErrs(e => ({ ...e, [k]: "" }));
    setApiErr("");
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrs(e => ({ ...e, location_pin: "Geolocation not supported" }));
      return;
    }
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        set("location_pin",
          `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`);
        setLocBusy(false);
      },
      () => {
        setErrs(e => ({ ...e, location_pin: "Could not get location. Please try again." }));
        setLocBusy(false);
      },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name   = "Required";
    if (!form.contact.trim())      e.contact        = "Required";
    if (!form.preferred_date)      e.preferred_date = "Required";
    if (!form.time_slot)           e.time_slot      = "Please select a time";
    if (form.preferred_date && form.preferred_date < todayISO())
      e.preferred_date = "Please select today or a future date";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true); setApiErr("");
    try {
      const res = await fetch(`${WORKER}/hc-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name:   form.patient_name.trim(),
          contact:        normalizePhone(form.contact),
          dob:            form.dob,
          preferred_date: form.preferred_date,
          time_slot:      form.time_slot,
          tests_required: form.tests_required.trim(),
          notes:          form.notes.trim(),
          location_pin:   form.location_pin,
          language:       lang,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Submission failed");
      onBooked({ ...form, id: data.id });
    } catch (err) {
      setApiErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const localPhone    = form.contact.startsWith("971") ? form.contact.slice(3) : form.contact;
  const availOptions  = getAvailableOptions(form.preferred_date);
  const mapCoords     = form.location_pin ? form.location_pin.split(",") : null;
  const lat           = mapCoords ? parseFloat(mapCoords[0]) : null;
  const lng           = mapCoords ? parseFloat(mapCoords[1]) : null;

  return (
    <div className={`portal-page${isRtl ? " rtl" : " ltr"}`}>
      <div className="form-body">
        {apiErr && <div className="error-msg">{apiErr}</div>}

        <div className="form-title">Request an Appointment</div>
        <div className="form-subtitle">Book a home sample collection in minutes.</div>

        {/* ── YOUR DETAILS ─────────────────────────────────────── */}
        <div className="section-label">Your Details</div>

        <div className="field-group">
          <label className="field-label">Full Name</label>
          <input className={`field-input${errs.patient_name ? " error" : ""}`}
            value={form.patient_name}
            placeholder="Enter your full name"
            onChange={e => set("patient_name", e.target.value)} />
          {errs.patient_name && <div className="field-error">{errs.patient_name}</div>}
        </div>

        <div className="field-group">
          <label className="field-label">Mobile Number</label>
          <div className="phone-wrap">
            <div className="phone-code">+971</div>
            <input className="phone-number" type="tel"
              value={localPhone} placeholder="50 123 4567"
              onChange={e => set("contact", normalizePhone(e.target.value))} />
          </div>
          {errs.contact && <div className="field-error">{errs.contact}</div>}
        </div>

        <div className="field-group">
          <label className="field-label">Date of Birth</label>
          <input className="field-input" type="date" value={form.dob}
            onChange={e => set("dob", e.target.value)} />
        </div>

        {/* ── SCHEDULE ─────────────────────────────────────────── */}
        <div className="section-label">Schedule</div>

        <div className="field-row">
          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="field-label">Preferred Date</label>
            <input className={`field-input${errs.preferred_date ? " error" : ""}`}
              type="date" value={form.preferred_date} min={todayISO()}
              onChange={e => { if (e.target.value >= todayISO()) set("preferred_date", e.target.value); }} />
            {errs.preferred_date && <div className="field-error">{errs.preferred_date}</div>}
          </div>

          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="field-label">Preferred Time</label>
            <select className={`field-input${errs.time_slot ? " error" : ""}`}
              value={form.time_slot}
              onChange={e => set("time_slot", e.target.value)}>
              <option value="">Select…</option>
              {availOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              {availOptions.length === 0 && (
                <option disabled>No slots for today</option>
              )}
            </select>
            {errs.time_slot && <div className="field-error">{errs.time_slot}</div>}
          </div>
        </div>

        {/* ── VISIT DETAILS ────────────────────────────────────── */}
        <div className="section-label">Visit Details</div>

        <div className="field-group">
          <label className="field-label">Tests Required</label>
          <input className="field-input" value={form.tests_required}
            placeholder="e.g. CBC, Vitamin D, Lipid Profile"
            onChange={e => set("tests_required", e.target.value)} />
        </div>

        <div className="field-group">
          <label className="field-label">Location</label>
          <button
            className={`location-btn${form.location_pin ? " captured" : ""}`}
            onClick={captureLocation} disabled={locBusy}>
            {locBusy ? "Getting your location…"
              : form.location_pin ? "✅ Location captured — tap to update"
              : "📍  Use my current location"}
          </button>

          {/* Map preview */}
          {lat && lng && (
            <div className="map-preview">
              <iframe
                title="Location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`}
              />
              <div className="map-coords-bar">
                <span className="map-coords-text">
                  📌 {lat.toFixed(4)}°, {lng.toFixed(4)}°
                </span>
                <a href={`https://maps.google.com/?q=${lat},${lng}`}
                  target="_blank" rel="noreferrer" className="map-coords-link">
                  Open in Maps ↗
                </a>
              </div>
            </div>
          )}
          {errs.location_pin && <div className="field-error">{errs.location_pin}</div>}
        </div>

        <div className="field-group">
          <label className="field-label">
            Notes <span className="field-label-optional">· optional</span>
          </label>
          <input className="field-input" value={form.notes}
            placeholder="Gate code, building, floor..."
            onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="disclaimer">
          Your information is kept private and used only for your appointment.
        </div>

        <button className="btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
