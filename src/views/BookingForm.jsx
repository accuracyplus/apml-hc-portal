// portal/src/views/BookingForm.jsx
import { useState } from "react";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";
const AREAS  = ["Abu Dhabi City", "Shabiya", "Al Ain", "Dubai"];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

function blank() {
  return {
    patient_name: "", contact: "",
    preferred_date: "", time_slot: "Morning",
    area: "", tests_required: "", notes: "",
  };
}

export default function BookingForm({ lang, t, onBooked }) {
  const [form,  setForm]  = useState(blank);
  const [errs,  setErrs]  = useState({});
  const [busy,  setBusy]  = useState(false);
  const [apiErr,setApiErr]= useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: "" }));
    setApiErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim())   e.patient_name   = t("required");
    if (!form.contact.trim())        e.contact        = t("required");
    if (!form.preferred_date)        e.preferred_date = t("required");
    if (!form.area)                  e.area           = t("required");
    if (form.preferred_date && form.preferred_date < todayISO())
      e.preferred_date = t("pastDateError") || "Please select today or a future date";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setApiErr("");
    try {
      const res = await fetch(`${WORKER}/hc-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
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

  const inp = (k, props = {}) => (
    <input
      className={`field-input${errs[k] ? " error" : ""}`}
      value={form[k]}
      onChange={e => set(k, e.target.value)}
      {...props}
    />
  );

  const isRtl = lang === "ar";

  return (
    <div className={`portal-page${isRtl ? " rtl" : " ltr"}`}>
      {/* Hero */}
      <div className="portal-hero">
        <h1>{t("bookTitle")}</h1>
        <p>{t("bookSubtitle")}</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {apiErr && <div className="error-msg">{apiErr}</div>}

        {/* Patient name */}
        <div className="field-group">
          <label className="field-label">{t("patientName")} *</label>
          {inp("patient_name", { placeholder: t("patientNamePh") })}
          {errs.patient_name && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errs.patient_name}</div>}
        </div>

        {/* Contact */}
        <div className="field-group">
          <label className="field-label">{t("mobile")} *</label>
          {inp("contact", { type: "tel", placeholder: "05X XXX XXXX" })}
          {errs.contact && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errs.contact}</div>}
        </div>

        {/* Area */}
        <div className="field-group">
          <label className="field-label">{t("area")} *</label>
          <select className={`field-input${errs.area ? " error" : ""}`}
            value={form.area} onChange={e => set("area", e.target.value)}>
            <option value="">{t("selectArea")}</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {errs.area && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errs.area}</div>}
        </div>

        {/* Date */}
        <div className="field-group">
          <label className="field-label">{t("preferredDate")} *</label>
          <input
            className={`field-input${errs.preferred_date ? " error" : ""}`}
            type="date"
            value={form.preferred_date}
            min={todayISO()}
            onChange={e => {
              if (e.target.value < todayISO()) {
                setErrs(er => ({ ...er, preferred_date: "Please select today or a future date" }));
                return;
              }
              set("preferred_date", e.target.value);
            }}
          />
          {errs.preferred_date && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errs.preferred_date}</div>}
        </div>

        {/* Time slot */}
        <div className="field-group">
          <label className="field-label">{t("timeSlot")}</label>
          <div className="pill-row">
            {["Morning", "Afternoon", "Evening"].map(ts => (
              <button key={ts}
                className={`pill${form.time_slot === ts ? " active" : ""}`}
                onClick={() => set("time_slot", ts)}>
                {t(ts.toLowerCase()) || ts}
              </button>
            ))}
          </div>
        </div>

        {/* Tests */}
        <div className="field-group">
          <label className="field-label">{t("tests")}</label>
          {inp("tests_required", { placeholder: t("testsPh") })}
        </div>

        {/* Notes */}
        <div className="field-group">
          <label className="field-label">{t("notes")}</label>
          {inp("notes", { placeholder: t("notesPh") })}
        </div>

        <div className="disclaimer">{t("disclaimer")}</div>

        <button className="btn-primary" onClick={submit} disabled={busy}
          style={{ marginBottom: 24 }}>
          {busy ? t("submitting") : t("submit")}
        </button>
      </div>
    </div>
  );
}
