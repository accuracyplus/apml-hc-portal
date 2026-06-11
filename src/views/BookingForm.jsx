// portal/src/views/BookingForm.jsx — sky blue theme, time ranges, map preview
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

// Time range slots
const TIME_RANGES = [
  { id: "6-8",   label: "Early Morning", range: "6:00 – 8:00 AM",  icon: "🌄", start: 6  },
  { id: "8-11",  label: "Morning",        range: "8:00 – 11:00 AM", icon: "🌅", start: 8  },
  { id: "11-14", label: "Midday",          range: "11:00 AM – 2:00 PM", icon: "☀️", start: 11 },
  { id: "14-17", label: "Afternoon",       range: "2:00 – 5:00 PM", icon: "🌤", start: 14 },
  { id: "17-20", label: "Evening",         range: "5:00 – 8:00 PM", icon: "🌙", start: 17 },
];

const getAvailableSlots = date => {
  if (date !== todayISO()) return TIME_RANGES;
  const h = uaeHour();
  return TIME_RANGES.filter(s => s.start > h);
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
        const av = getAvailableSlots(v).map(s => s.id);
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
      () => { setErrs(e => ({ ...e, location_pin: "Could not get location" })); setLocBusy(false); },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name   = t("required") || "Required";
    if (!form.contact.trim())      e.contact        = t("required") || "Required";
    if (!form.preferred_date)      e.preferred_date = t("required") || "Required";
    if (!form.time_slot)           e.time_slot      = t("selectSlot") || "Please select a time";
    if (form.preferred_date && form.preferred_date < todayISO())
      e.preferred_date = "Please select today or a future date";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true); setApiErr("");
    // Store the slot label for display
    const slot = TIME_RANGES.find(s => s.id === form.time_slot);
    try {
      const res = await fetch(`${WORKER}/hc-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name:   form.patient_name.trim(),
          contact:        normalizePhone(form.contact),
          dob:            form.dob,
          preferred_date: form.preferred_date,
          time_slot:      slot ? `${slot.label} (${slot.range})` : form.time_slot,
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
  const availSlots    = getAvailableSlots(form.preferred_date);
  const availIds      = availSlots.map(s => s.id);
  const mapCoords     = form.location_pin ? form.location_pin.split(",") : null;

  return (
    <div className={`portal-page anim-slide${isRtl ? " rtl" : " ltr"}`}>
      {/* Hero */}
      <div className="request-hero">
        <div className="request-hero-icon">🏥</div>
        <h2 className="request-hero-title">
          {t("requestTitle") || "Request an Appointment"}
        </h2>
        <p className="request-hero-sub">
          {t("requestSub") || "Fill in your details and we will confirm shortly"}
        </p>
      </div>

      <div className="form-body">
        {apiErr && <div className="error-msg">{apiErr}</div>}

        {/* Patient name */}
        <div className="field-group">
          <label className="field-label">{t("patientName") || "Full Name"} <span className="req">*</span></label>
          <input className={`field-input${errs.patient_name ? " error" : ""}`}
            value={form.patient_name}
            placeholder={t("patientNamePh") || "Patient full name"}
            onChange={e => set("patient_name", e.target.value)} />
          {errs.patient_name && <ErrMsg>{errs.patient_name}</ErrMsg>}
        </div>

        {/* Mobile */}
        <div className="field-group">
          <label className="field-label">{t("mobile") || "Mobile Number"} <span className="req">*</span></label>
          <div className="phone-input-wrap">
            <div className="phone-prefix">🇦🇪 +971</div>
            <input className="field-input phone-input-field"
              type="tel" value={localPhone} placeholder="5X XXX XXXX"
              onChange={e => set("contact", normalizePhone(e.target.value))} />
          </div>
          {errs.contact && <ErrMsg>{errs.contact}</ErrMsg>}
        </div>

        {/* Date of birth */}
        <div className="field-group">
          <label className="field-label">{t("dob") || "Date of Birth"}</label>
          <input className="field-input" type="date" value={form.dob}
            onChange={e => set("dob", e.target.value)} />
        </div>

        {/* Date */}
        <div className="field-group">
          <label className="field-label">{t("preferredDate") || "Preferred Date"} <span className="req">*</span></label>
          <input className={`field-input${errs.preferred_date ? " error" : ""}`}
            type="date" value={form.preferred_date} min={todayISO()}
            onChange={e => { if (e.target.value >= todayISO()) set("preferred_date", e.target.value); }} />
          {errs.preferred_date && <ErrMsg>{errs.preferred_date}</ErrMsg>}
        </div>

        {/* Time ranges */}
        <div className="field-group">
          <label className="field-label">{t("timeSlot") || "Preferred Time"} <span className="req">*</span></label>
          <div className="slot-grid">
            {TIME_RANGES.map(ts => {
              const disabled = form.preferred_date && !availIds.includes(ts.id);
              const active   = form.time_slot === ts.id;
              return (
                <button key={ts.id}
                  disabled={disabled}
                  onClick={() => !disabled && set("time_slot", ts.id)}
                  className={`slot-btn${active ? " active" : ""}${disabled ? " disabled" : ""}`}>
                  <span className="slot-icon">{ts.icon}</span>
                  <span className="slot-label">{ts.label}</span>
                  <span className="slot-range">{ts.range}</span>
                  {disabled && form.preferred_date === todayISO() && (
                    <span className="slot-past">Passed</span>
                  )}
                </button>
              );
            })}
          </div>
          {errs.time_slot && <ErrMsg>{errs.time_slot}</ErrMsg>}
        </div>

        {/* Tests */}
        <div className="field-group">
          <label className="field-label">{t("tests") || "Tests Required"}</label>
          <input className="field-input" value={form.tests_required}
            placeholder={t("testsPh") || "e.g. CBC, HbA1c, Lipid Profile…"}
            onChange={e => set("tests_required", e.target.value)} />
        </div>

        {/* Location + map preview */}
        <div className="field-group">
          <label className="field-label">{t("location") || "Your Location"}</label>
          <button
            className={`location-btn${form.location_pin ? " captured" : ""}`}
            onClick={captureLocation} disabled={locBusy}>
            {locBusy ? "📍 Getting your location…"
              : form.location_pin ? "✅ Location captured — tap to update"
              : "📍 " + (t("shareLocation") || "Share My Location")}
          </button>

          {/* Embedded map preview */}
          {mapCoords && mapCoords.length === 2 && (
            <div style={{ marginTop: 10, borderRadius: 14, overflow: "hidden",
              boxShadow: "0 4px 16px rgba(14,165,233,0.15)", height: 200 }}>
              <iframe
                title="Location preview"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapCoords[1])-0.005},${parseFloat(mapCoords[0])-0.005},${parseFloat(mapCoords[1])+0.005},${parseFloat(mapCoords[0])+0.005}&layer=mapnik&marker=${mapCoords[0]},${mapCoords[1]}`}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
              <div style={{ padding: "6px 12px", background: "var(--sky-faint)",
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--navy-60)", fontWeight: 600 }}>
                  📌 {parseFloat(mapCoords[0]).toFixed(4)}°, {parseFloat(mapCoords[1]).toFixed(4)}°
                </span>
                <a href={`https://maps.google.com/?q=${form.location_pin}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: "var(--sky-dark)", fontWeight: 800,
                    textDecoration: "none" }}>
                  Open in Maps ↗
                </a>
              </div>
            </div>
          )}
          {errs.location_pin && <ErrMsg>{errs.location_pin}</ErrMsg>}
        </div>

        {/* Notes */}
        <div className="field-group">
          <label className="field-label">{t("notes") || "Additional Notes"}</label>
          <input className="field-input" value={form.notes}
            placeholder={t("notesPh") || "Fasting info, building name, floor…"}
            onChange={e => set("notes", e.target.value)} />
        </div>

        <p className="disclaimer">{t("disclaimer") || "Your information is kept private and used only to process your appointment."}</p>

        <button className="btn-primary" onClick={submit} disabled={busy}>
          {busy ? (t("submitting") || "Submitting…") : (t("submitRequest") || "Submit Request")}
        </button>
      </div>
    </div>
  );
}

const ErrMsg = ({ children }) => (
  <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4, fontWeight: 700 }}>
    {children}
  </div>
);
