// portal/src/views/BookingForm.jsx — premium with all improvements
import { useState, useEffect, useRef } from "react";

const WORKER = import.meta.env.VITE_WORKER_URL ?? "https://apml-tracker.sinusuresh.workers.dev";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const uaeHour = () => {
  try {
    const s = new Date().toLocaleString("en-US",
      { timeZone: "Asia/Dubai", hour: "numeric", hour12: false });
    return parseInt(s, 10);
  } catch { return new Date().getHours(); }
};

// Generate 30-min intervals 6:00–20:00
const buildTimeOptions = () => {
  const opts = [];
  for (let h = 6; h < 20; h++) {
    for (const m of [0, 30]) {
      const hh   = String(h).padStart(2, "0");
      const mm   = String(m).padStart(2, "0");
      const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${h12}:${mm} ${ampm}`;
      opts.push({ value: `${hh}:${mm}`, label, h });
    }
  }
  return opts;
};
const ALL_TIME_OPTIONS = buildTimeOptions();

const getAvailableTimes = date => {
  if (date !== todayISO()) return ALL_TIME_OPTIONS;
  const h = uaeHour();
  return ALL_TIME_OPTIONS.filter(o => o.h > h);
};

const parsePhone = raw => {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits || "";
};

const blank = () => ({
  patient_name: "", contact_code: "971", contact_number: "",
  dob: "", preferred_date: "", time_slot: "",
  tests_required: "", notes: "", location_pin: "",
});

// ── Draggable Leaflet Map ─────────────────────────────────────────────────
function DraggableMap({ value, onChange }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);

  const defaultLat = 24.4539, defaultLng = 54.3773; // Abu Dhabi
  const [lat, lng] = value
    ? value.split(",").map(Number)
    : [defaultLat, defaultLng];

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = () => {
      const L = window.L;
      if (!L || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng], zoom: 15,
        zoomControl: true, attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      // Custom teal pin
      const icon = L.divIcon({
        html: `<div style="
          width:22px;height:22px;border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#3C7871,#5B9090);
          border:3px solid white;box-shadow:0 3px 10px rgba(60,120,113,0.5);
          transform:rotate(-45deg);
        "></div>`,
        className: "", iconSize: [22, 22], iconAnchor: [11, 22],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(`${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`);
      });

      map.on("click", e => {
        marker.setLatLng(e.latlng);
        onChange(`${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`);
      });
    };

    // Load Leaflet if needed
    if (window.L) {
      initMap();
    } else {
      if (!document.querySelector("link[href*='leaflet']")) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);
      }
      if (!document.querySelector("script[src*='leaflet']")) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Sync marker when value changes (e.g. GPS capture)
  useEffect(() => {
    if (!value || !markerRef.current || !mapRef.current) return;
    const [newLat, newLng] = value.split(",").map(Number);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapRef.current.panTo([newLat, newLng]);
    }
  }, [value]);

  return (
    <div style={{ marginTop: 10, borderRadius: 16, overflow: "hidden",
      border: "1.5px solid rgba(60,120,113,0.2)",
      boxShadow: "0 4px 16px rgba(60,120,113,0.12)" }}>
      <div ref={containerRef} style={{ height: 220, display: "block" }} />
      <div style={{ padding: "8px 14px",
        background: "linear-gradient(135deg, rgba(60,120,113,0.08), rgba(91,144,144,0.05))",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid rgba(60,120,113,0.12)" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
          📌 Drag pin or tap map to adjust location
        </span>
        {value && (
          <a href={`https://maps.google.com/?q=${value}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: "var(--teal)", fontWeight: 800,
              textDecoration: "none", marginLeft: 8 }}>
            Maps ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function BookingForm({ lang, t, onBooked }) {
  const [form,    setForm]    = useState(blank);
  const [errs,    setErrs]    = useState({});
  const [busy,    setBusy]    = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [locBusy, setLocBusy] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const isRtl = lang === "ar";

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === "preferred_date") {
        const avTimes = getAvailableTimes(v).map(o => o.value);
        if (next.time_slot && !avTimes.includes(next.time_slot)) next.time_slot = "";
      }
      return next;
    });
    setErrs(e => ({ ...e, [k]: "" }));
    setApiErr("");
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrs(e => ({ ...e, location: "Geolocation not supported" }));
      return;
    }
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const pin = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        set("location_pin", pin);
        setShowMap(true);
        setLocBusy(false);
      },
      () => { setErrs(e => ({ ...e, location: "Could not get location" })); setLocBusy(false); },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name = "Required";
    if (!form.contact_number.trim()) e.contact_number = "Required";
    if (!form.preferred_date) e.preferred_date = "Required";
    if (!form.time_slot) e.time_slot = "Please select a time";
    if (form.preferred_date && form.preferred_date < todayISO())
      e.preferred_date = "Please select today or a future date";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true); setApiErr("");
    const fullNumber = parsePhone(form.contact_code) + parsePhone(form.contact_number);
    try {
      const res = await fetch(`${WORKER}/hc-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name:   form.patient_name.trim(),
          contact:        fullNumber,
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
      onBooked({ ...form, contact: fullNumber, id: data.id });
    } catch (err) {
      setApiErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const availTimes = getAvailableTimes(form.preferred_date);

  return (
    <div className={`portal-page${isRtl ? " rtl" : " ltr"}`}>
      <div className="form-body">
        {apiErr && <div className="error-msg">{apiErr}</div>}

        <div className="form-title">Request an Appointment</div>
        <div className="form-subtitle">Book a home sample collection in minutes.</div>

        {/* ── YOUR DETAILS ────────────────────────────── */}
        <div className="section-block">
          <div className="section-label">Your Details</div>

          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className={`field-input${errs.patient_name ? " error" : ""}`}
              value={form.patient_name}
              placeholder="Enter your full name"
              onChange={e => set("patient_name", e.target.value)} />
            {errs.patient_name && <div className="field-error">{errs.patient_name}</div>}
          </div>

          {/* Mobile — editable code */}
          <div className="field-group">
            <label className="field-label">Mobile Number</label>
            <div className="phone-wrap">
              <input
                className="phone-code-input"
                type="tel"
                value={form.contact_code}
                maxLength={4}
                onChange={e => set("contact_code", e.target.value.replace(/\D/g, ""))}
                title="Country code (editable)"
              />
              <input className="phone-number" type="tel"
                value={form.contact_number}
                placeholder="50 123 4567"
                onChange={e => set("contact_number", e.target.value.replace(/\D/g, ""))} />
            </div>
            {errs.contact_number && <div className="field-error">{errs.contact_number}</div>}
          </div>

          <div className="field-group">
            <label className="field-label">Date of Birth</label>
            <input className="field-input" type="date" value={form.dob}
              onChange={e => set("dob", e.target.value)} />
          </div>
        </div>

        {/* ── SCHEDULE ────────────────────────────────── */}
        <div className="section-block">
          <div className="section-label">Schedule</div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Preferred Date</label>
              <input className={`field-input${errs.preferred_date ? " error" : ""}`}
                type="date" value={form.preferred_date} min={todayISO()}
                onChange={e => { if (e.target.value >= todayISO()) set("preferred_date", e.target.value); }} />
              {errs.preferred_date && <div className="field-error" style={{ fontSize: 10 }}>{errs.preferred_date}</div>}
            </div>

            <div className="field-group">
              <label className="field-label">Time</label>
              <select className={`field-input${errs.time_slot ? " error" : ""}`}
                value={form.time_slot}
                onChange={e => set("time_slot", e.target.value)}>
                <option value="">Select…</option>
                {availTimes.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
                {availTimes.length === 0 && (
                  <option disabled>No slots today</option>
                )}
              </select>
              {errs.time_slot && <div className="field-error" style={{ fontSize: 10 }}>{errs.time_slot}</div>}
            </div>
          </div>
        </div>

        {/* ── VISIT DETAILS ────────────────────────────── */}
        <div className="section-block">
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
              {locBusy ? "📍 Getting your location…"
                : form.location_pin ? "✅ Location captured — tap to update"
                : "📍  Use my current location"}
            </button>
            {errs.location && <div className="field-error">{errs.location}</div>}

            {/* Draggable map */}
            {showMap && form.location_pin && (
              <DraggableMap
                value={form.location_pin}
                onChange={pin => set("location_pin", pin)}
              />
            )}
            {form.location_pin && !showMap && (
              <button onClick={() => setShowMap(true)}
                style={{ marginTop: 8, background: "none", border: "none",
                  color: "var(--teal)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "var(--font)", padding: 0 }}>
                📍 View / adjust on map →
              </button>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">
              Notes <span className="field-label-optional">· optional</span>
            </label>
            <input className="field-input" value={form.notes}
              placeholder="Gate code, building, floor..."
              onChange={e => set("notes", e.target.value)} />
          </div>
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
