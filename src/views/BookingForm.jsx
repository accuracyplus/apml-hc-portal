// views/BookingForm.jsx
// Patient-facing booking request form. No login required.
// Posts to /hc-request on the main worker (public endpoint, no auth key).

import { useState, useRef } from "react";
import { WORKER } from "../App.jsx";
import { AREA_MAP } from "../i18n.js";

const todayISO = () => new Date().toISOString().slice(0, 10);

function emptyForm() {
  return {
    patient_name: "", contact: "",
    preferred_date: todayISO(), time_slot: "Morning",
    area: "", location_pin: "",
    tests_required: "", notes: "",
  };
}

export default function BookingForm({ t, lang, onConfirm }) {
  const [form, setForm]       = useState(emptyForm);
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [locStatus, setLoc]   = useState("idle"); // idle | loading | ok | fail
  const [apiError, setApiErr] = useState("");
  const submRef               = useRef(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
    setApiErr("");
  };

  // ── Geolocation ─────────────────────────────────────────────────────────
  const shareLocation = () => {
    if (!navigator.geolocation) { setLoc("fail"); return; }
    setLoc("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const link = `https://maps.google.com/?q=${lat},${lng}`;
        set("location_pin", link);
        setLoc("ok");
      },
      () => setLoc("fail"),
      { timeout: 10000 }
    );
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name  = t.required;
    if (!form.contact.trim())      e.contact       = t.required;
    if (!form.preferred_date)      e.preferred_date = t.required;
    if (!form.area)                e.area          = t.required;
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submRef.current) return;
    if (!validate()) return;
    submRef.current = true;
    setSub(true);
    setApiErr("");

    try {
      const res = await fetch(`${WORKER}/hc-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
      onConfirm({ ...form, id: data.id });
    } catch (e) {
      setApiErr(e.message || "Something went wrong. Please try again.");
    } finally {
      setSub(false);
      submRef.current = false;
    }
  };

  // ── Area options (EN uses English keys, AR uses Arabic display) ──────────
  const areaOptions = [
    "Abu Dhabi City", "Shabiya", "Al Ain", "Dubai"
  ];

  return (
    <div>
      {/* Hero */}
      <div className="portal-hero">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroSub}</p>
      </div>

      <div className="portal-page">
        <div style={{ marginBottom: 20, fontSize: 15, fontWeight: 700,
          color: "var(--navy)" }}>{t.formTitle}</div>

        {apiError && <div className="error-msg">{apiError}</div>}

        {/* Name */}
        <div className="field-group">
          <label className="field-label">{t.name} *</label>
          <input className={`field-input ${errors.patient_name ? "error" : ""}`}
            type="text" value={form.patient_name} placeholder={t.namePh}
            onChange={e => set("patient_name", e.target.value)} />
          {errors.patient_name && <div style={{ color:"var(--error)", fontSize:12, marginTop:4 }}>{errors.patient_name}</div>}
        </div>

        {/* Mobile */}
        <div className="field-group">
          <label className="field-label">{t.mobile} *</label>
          <input className={`field-input ${errors.contact ? "error" : ""}`}
            type="tel" value={form.contact} placeholder={t.mobilePh}
            onChange={e => set("contact", e.target.value)} />
          {errors.contact && <div style={{ color:"var(--error)", fontSize:12, marginTop:4 }}>{errors.contact}</div>}
        </div>

        {/* Date */}
        <div className="field-group">
          <label className="field-label">{t.date} *</label>
          <input className={`field-input ${errors.preferred_date ? "error" : ""}`}
            type="date" value={form.preferred_date} min={todayISO()}
            onChange={e => set("preferred_date", e.target.value)} />
        </div>

        {/* Time slot */}
        <div className="field-group">
          <label className="field-label">{t.timeSlot}</label>
          <div className="pill-row">
            {["Morning", "Afternoon", "Evening"].map((s, i) => (
              <button key={s} className={`pill ${form.time_slot === s ? "active" : ""}`}
                onClick={() => set("time_slot", s)}>
                {[t.morning, t.afternoon, t.evening][i]}
              </button>
            ))}
          </div>
        </div>

        {/* Area */}
        <div className="field-group">
          <label className="field-label">{t.area} *</label>
          <select className={`field-input ${errors.area ? "error" : ""}`}
            value={form.area} onChange={e => set("area", e.target.value)}
            style={{ appearance: "auto" }}>
            <option value="">{t.areaSelect}</option>
            {areaOptions.map(a => (
              <option key={a} value={a}>
                {lang === "ar" ? AREA_MAP[a] : a}
              </option>
            ))}
          </select>
          {errors.area && <div style={{ color:"var(--error)", fontSize:12, marginTop:4 }}>{errors.area}</div>}
        </div>

        {/* Location */}
        <div className="field-group">
          <label className="field-label">{t.location}</label>
          <button
            className={`location-btn ${locStatus === "ok" ? "captured" : ""}`}
            onClick={shareLocation}
            disabled={locStatus === "loading"}>
            {locStatus === "loading" && "⏳ Locating…"}
            {locStatus === "ok"      && t.locationOk}
            {locStatus === "fail"    && t.locationFail}
            {locStatus === "idle"    && t.locationBtn}
          </button>
        </div>

        {/* Tests */}
        <div className="field-group">
          <label className="field-label">{t.tests}</label>
          <input className="field-input" type="text"
            value={form.tests_required} placeholder={t.testsPh}
            onChange={e => set("tests_required", e.target.value)} />
        </div>

        {/* Notes */}
        <div className="field-group">
          <label className="field-label">{t.notes}</label>
          <textarea className="field-input" rows={3}
            value={form.notes} placeholder={t.notesPh}
            onChange={e => set("notes", e.target.value)}
            style={{ resize: "vertical" }} />
        </div>

        {/* Submit */}
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}
          style={{ marginTop: 8 }}>
          {submitting ? t.submitting : t.submit}
        </button>

        <p className="disclaimer">{t.disclaimer}</p>
      </div>
    </div>
  );
}
