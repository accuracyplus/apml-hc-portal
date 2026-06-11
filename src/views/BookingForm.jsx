// portal/src/views/BookingForm.jsx — premium, no area selector
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

const getAvailableSlots = date => {
  if (date !== todayISO()) return ["Morning", "Afternoon", "Evening"];
  const h = uaeHour();
  return [
    ...(h < 11 ? ["Morning"]   : []),
    ...(h < 16 ? ["Afternoon"] : []),
    ...(h < 20 ? ["Evening"]   : []),
  ];
};

const normalizePhone = raw => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("971")) return digits;
  if (digits.startsWith("0"))   return "971" + digits.slice(1);
  return "971" + digits;
};

const fmtCoords = pin => {
  if (!pin) return null;
  const [lat, lng] = pin.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) return null;
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
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
        const av = getAvailableSlots(v);
        if (next.time_slot && !av.includes(next.time_slot)) next.time_slot = av[0] || "";
      }
      return next;
    });
    setErrs(e => ({ ...e, [k]: "" }));
    setApiErr("");
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrs(e => ({ ...e, location_pin: "Geolocation not supported on this device" }));
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
    try {
      const res  = await fetch(`${WORKER}/hc-request`, {
        method:  "POST",
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
  const availSlots    = getAvailableSlots(form.preferred_date);
  const coords        = fmtCoords(form.location_pin);
  const slotLabels    = { Morning: "🌅 Morning", Afternoon: "🌤 Afternoon", Evening: "🌙 Evening" };

  return (
    <div className={`portal-page anim-slide${isRtl ? " rtl" : " ltr"}`}>

      {/* Request header */}
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
        <FormField label={t("patientName") || "Full Name"} required error={errs.patient_name}>
          <input className={`field-input${errs.patient_name ? " error" : ""}`}
            value={form.patient_name}
            placeholder={t("patientNamePh") || "Patient full name"}
            onChange={e => set("patient_name", e.target.value)} />
        </FormField>

        {/* Mobile with +971 */}
        <FormField label={t("mobile") || "Mobile Number"} required error={errs.contact}>
          <div className="phone-input-wrap">
            <div className="phone-prefix">🇦🇪 +971</div>
            <input className="field-input phone-input-field"
              type="tel" value={localPhone} placeholder="5X XXX XXXX"
              onChange={e => set("contact", normalizePhone(e.target.value))} />
          </div>
        </FormField>

        {/* Date of birth */}
        <FormField label={t("dob") || "Date of Birth"}>
          <input className="field-input" type="date" value={form.dob}
            onChange={e => set("dob", e.target.value)} />
        </FormField>

        {/* Preferred date */}
        <FormField label={t("preferredDate") || "Preferred Date"} required error={errs.preferred_date}>
          <input className={`field-input${errs.preferred_date ? " error" : ""}`}
            type="date" value={form.preferred_date} min={todayISO()}
            onChange={e => { if (e.target.value >= todayISO()) set("preferred_date", e.target.value); }} />
        </FormField>

        {/* Time slot */}
        <FormField label={t("timeSlot") || "Preferred Time"} required error={errs.time_slot}>
          <div className="slot-grid">
            {["Morning","Afternoon","Evening"].map(ts => {
              const disabled = form.preferred_date && !availSlots.includes(ts);
              return (
                <button key={ts}
                  disabled={disabled}
                  onClick={() => !disabled && set("time_slot", ts)}
                  className={`slot-btn${form.time_slot === ts ? " active" : ""}${disabled ? " disabled" : ""}`}>
                  <span className="slot-icon">{ts === "Morning" ? "🌅" : ts === "Afternoon" ? "🌤" : "🌙"}</span>
                  <span className="slot-label">{t(ts.toLowerCase()) || ts}</span>
                  {disabled && form.preferred_date === todayISO() && (
                    <span className="slot-past">Passed</span>
                  )}
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Tests */}
        <FormField label={t("tests") || "Tests Required"}>
          <input className="field-input" value={form.tests_required}
            placeholder={t("testsPh") || "e.g. CBC, HbA1c, Lipid Profile…"}
            onChange={e => set("tests_required", e.target.value)} />
        </FormField>

        {/* Location */}
        <FormField label={t("location") || "Your Location"}>
          <button
            className={`location-btn${coords ? " captured" : ""}`}
            onClick={captureLocation} disabled={locBusy}>
            {locBusy ? "Getting your location…"
              : coords ? "✅ Location captured"
              : "📍 " + (t("shareLocation") || "Share My Location")}
          </button>
          {coords && (
            <div className="coords-display">
              <span className="coords-text">📌 {coords}</span>
              <a href={`https://maps.google.com/?q=${form.location_pin}`}
                target="_blank" rel="noreferrer" className="coords-link">
                View on Maps ↗
              </a>
            </div>
          )}
          {errs.location_pin && <ErrMsg>{errs.location_pin}</ErrMsg>}
        </FormField>

        {/* Notes */}
        <FormField label={t("notes") || "Additional Notes"}>
          <input className="field-input" value={form.notes}
            placeholder={t("notesPh") || "Fasting instructions, building name, floor…"}
            onChange={e => set("notes", e.target.value)} />
        </FormField>

        <p className="disclaimer">{t("disclaimer") || "Your information is kept private and used only to process your appointment."}</p>

        <button className="btn-primary submit-btn" onClick={submit} disabled={busy}>
          {busy
            ? (t("submitting") || "Submitting…")
            : (t("submitRequest") || "Submit Request")}
        </button>
      </div>
    </div>
  );
}

const FormField = ({ label, required, error, children }) => (
  <div className="field-group">
    <label className="field-label">
      {label}{required && <span style={{ color: "var(--error)", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <ErrMsg>{error}</ErrMsg>}
  </div>
);

const ErrMsg = ({ children }) => (
  <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4, fontWeight: 600 }}>
    {children}
  </div>
);
