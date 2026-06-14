// portal/src/views/PrivacyPage.jsx
export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ minHeight:"100dvh", background:"var(--teal-faint, #EDF6F4)" }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#2E6560,#3C7871,#4A8A82)",
        padding:"max(52px,calc(env(safe-area-inset-top,0px) + 36px)) 20px 20px",
      }}>
        <button onClick={onBack} style={{
          background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.35)",
          borderRadius:99, padding:"7px 16px", color:"#fff", fontSize:13, fontWeight:700,
          cursor:"pointer", fontFamily:"var(--font)", marginBottom:14, display:"inline-flex",
          alignItems:"center", gap:6,
        }}>
          ← Back
        </button>
        <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:"#fff",
          letterSpacing:"-0.02em" }}>Privacy Notice</h1>
        <p style={{ margin:"6px 0 0", fontSize:12, color:"rgba(255,255,255,0.70)" }}>
          Accuracy Plus Medical Laboratory · Effective June 2026
        </p>
      </div>

      {/* Content */}
      <div style={{ padding:"24px 20px 48px", maxWidth:600, margin:"0 auto",
        fontSize:14, lineHeight:1.8, color:"#1A2E2B" }}>

        <Section title="1. Who We Are">
          Accuracy Plus Medical Laboratory (APML) is a licensed medical laboratory
          operating in Abu Dhabi, UAE, regulated by the Department of Health (DOH).
          This privacy notice applies to personal data collected through our Home
          Collection booking portal at <strong>apml-hc-portal.pages.dev</strong>.
        </Section>

        <Section title="2. Data We Collect">
          When you submit a home collection request, we collect:
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:0 }}>
            <li>Full name</li>
            <li>Mobile number</li>
            <li>Date of birth (optional — used to identify your booking)</li>
            <li>Preferred appointment date and time</li>
            <li>Tests requested</li>
            <li>Location pin (if shared)</li>
            <li>Additional notes you provide</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          Your data is used solely to:
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:0 }}>
            <li>Process and confirm your home collection appointment</li>
            <li>Assign and dispatch a phlebotomist to your location</li>
            <li>Contact you regarding your appointment</li>
            <li>Deliver your test results</li>
          </ul>
          We do not use your data for marketing, profiling, or any purpose unrelated
          to your appointment.
        </Section>

        <Section title="4. Legal Basis">
          We process your personal data under UAE Federal Decree-Law No. 45 of 2021
          (Personal Data Protection Law — PDPL) on the basis of:
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:0 }}>
            <li><strong>Contractual necessity</strong> — to provide the service you requested</li>
            <li><strong>Consent</strong> — which you provide by submitting the booking form</li>
          </ul>
        </Section>

        <Section title="5. Data Sharing">
          Your data is shared only with:
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:0 }}>
            <li>APML staff directly involved in your appointment (phlebotomists, coordinators)</li>
            <li>Microsoft (data storage via OneDrive — UAE region where available)</li>
            <li>Cloudflare (infrastructure provider — data in transit only)</li>
          </ul>
          We do not sell, rent, or share your data with third-party advertisers or
          data brokers.
        </Section>

        <Section title="6. Data Retention">
          Appointment records are retained for a minimum of 5 years as required by
          DOH regulations for medical records. After this period, records are securely
          deleted.
        </Section>

        <Section title="7. Your Rights">
          Under UAE PDPL, you have the right to:
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:0 }}>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion (subject to regulatory retention requirements)</li>
            <li>Withdraw consent at any time (by contacting us below)</li>
          </ul>
        </Section>

        <Section title="8. Contact Us">
          For privacy-related requests, contact:
          <div style={{ marginTop:8, padding:"12px 16px",
            background:"rgba(60,120,113,0.08)", borderRadius:12,
            border:"1px solid rgba(60,120,113,0.15)" }}>
            <div><strong>Accuracy Plus Medical Laboratory</strong></div>
            <div>Email: <a href="mailto:support@apml.co"
              style={{ color:"#3C7871", fontWeight:700 }}>support@apml.co</a></div>
            <div>Landline: <a href="tel:+97126333923"
              style={{ color:"#3C7871", fontWeight:700 }}>+971 2 633 3923</a></div>
            <div>Mobile/WhatsApp: <a href="tel:+971542346392"
              style={{ color:"#3C7871", fontWeight:700 }}>+971 54 234 6392</a></div>
            <div>Abu Dhabi, UAE · DOH Licensed</div>
          </div>
        </Section>

        <button onClick={onBack} style={{
          width:"100%", marginTop:24, padding:"14px", border:"none",
          borderRadius:99, background:"linear-gradient(135deg,#2E6560,#3C7871)",
          color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer",
          fontFamily:"var(--font)", boxShadow:"0 6px 20px rgba(46,101,96,0.25)",
        }}>
          ← Back to Booking
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ fontSize:15, fontWeight:800, color:"#2E6560",
        marginBottom:8, marginTop:0 }}>{title}</h2>
      <div style={{ color:"#3D5050" }}>{children}</div>
    </div>
  );
}
