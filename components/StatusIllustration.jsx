// components/StatusIllustration.jsx
// Animated per-status illustration using inline SVG + CSS animations.
// Each status has a unique cartoon visual + animation class.

import { STATUS_BG } from "../i18n.js";

// ── SVG Illustrations ─────────────────────────────────────────────────────────

const illustrations = {

  Requested: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard */}
      <rect x="20" y="18" width="60" height="72" rx="6" fill="#fff" stroke="#0EA5E9" strokeWidth="2.5"/>
      <rect x="36" y="12" width="28" height="14" rx="7" fill="#0EA5E9"/>
      {/* Lines */}
      <rect x="30" y="40" width="40" height="4" rx="2" fill="#E0F2FE"/>
      <rect x="30" y="52" width="32" height="4" rx="2" fill="#E0F2FE"/>
      <rect x="30" y="64" width="36" height="4" rx="2" fill="#E0F2FE"/>
      {/* Pending dots */}
      <circle cx="65" cy="78" r="3" fill="#0EA5E9" opacity="0.9"/>
      <circle cx="74" cy="78" r="3" fill="#0EA5E9" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" begin="0.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="83" cy="78" r="3" fill="#0EA5E9" opacity="0.3">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  Confirmed: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar */}
      <rect x="14" y="22" width="72" height="64" rx="8" fill="#fff" stroke="#22C55E" strokeWidth="2.5"/>
      <rect x="14" y="22" width="72" height="22" rx="8" fill="#22C55E"/>
      <rect x="14" y="36" width="72" height="8" fill="#22C55E"/>
      {/* Date pins */}
      <rect x="30" y="13" width="8" height="18" rx="4" fill="#166534"/>
      <rect x="62" y="13" width="8" height="18" rx="4" fill="#166534"/>
      {/* Big checkmark */}
      <polyline points="34,60 46,72 68,44" stroke="#22C55E" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dasharray" from="0,100" to="80,0" dur="0.5s" fill="freeze"/>
      </polyline>
    </svg>
  ),

  Assigned: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person */}
      <circle cx="50" cy="28" r="16" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2"/>
      <circle cx="50" cy="26" r="9" fill="#0EA5E9"/>
      {/* Body */}
      <path d="M22 80 C22 62 34 56 50 56 C66 56 78 62 78 80" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2"/>
      {/* Scrubs top */}
      <rect x="38" y="55" width="24" height="20" rx="4" fill="#0EA5E9"/>
      {/* Cross on chest */}
      <rect x="47" y="59" width="6" height="12" rx="2" fill="#fff"/>
      <rect x="44" y="62" width="12" height="6" rx="2" fill="#fff"/>
      {/* Medical bag */}
      <rect x="68" y="60" width="18" height="16" rx="4" fill="#fff" stroke="#0EA5E9" strokeWidth="2"/>
      <rect x="73" y="56" width="8" height="6" rx="2" stroke="#0EA5E9" strokeWidth="2" fill="none"/>
      <rect x="74.5" y="63" width="2" height="8" rx="1" fill="#0EA5E9"/>
      <rect x="71" y="66" width="8" height="2" rx="1" fill="#0EA5E9"/>
    </svg>
  ),

  "On the Way": () => (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Road */}
      <rect x="0" y="55" width="120" height="25" rx="4" fill="#E2E8F0"/>
      {/* Center dashes */}
      <rect x="5"  y="65" width="18" height="4" rx="2" fill="#fff"/>
      <rect x="33" y="65" width="18" height="4" rx="2" fill="#fff"/>
      <rect x="61" y="65" width="18" height="4" rx="2" fill="#fff"/>
      <rect x="89" y="65" width="18" height="4" rx="2" fill="#fff"/>
      {/* Car body */}
      <g>
        <rect x="25" y="28" width="55" height="28" rx="6" fill="#0EA5E9"/>
        {/* Roof */}
        <path d="M36 28 L44 14 L76 14 L84 28" fill="#0284C7" rx="4"/>
        {/* Windows */}
        <rect x="46" y="16" width="12" height="10" rx="3" fill="#BAE6FD"/>
        <rect x="62" y="16" width="12" height="10" rx="3" fill="#BAE6FD"/>
        {/* Wheels */}
        <circle cx="40" cy="56" r="9" fill="#1E293B"/>
        <circle cx="40" cy="56" r="5" fill="#94A3B8"/>
        <circle cx="75" cy="56" r="9" fill="#1E293B"/>
        <circle cx="75" cy="56" r="5" fill="#94A3B8"/>
        {/* APML cross on car */}
        <rect x="51" y="33" width="3" height="12" rx="1.5" fill="#fff" opacity="0.7"/>
        <rect x="47" y="37" width="11" height="3" rx="1.5" fill="#fff" opacity="0.7"/>
      </g>
      {/* Speed lines */}
      <line x1="2" y1="36" x2="18" y2="36" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="2" y1="44" x2="14" y2="44" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),

  Collected: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Test tube tilted */}
      <g transform="rotate(-20,50,50)">
        <rect x="42" y="14" width="16" height="58" rx="8" fill="#fff" stroke="#F59E0B" strokeWidth="2.5"/>
        {/* Liquid */}
        <rect x="43.2" y="42" width="13.6" height="29" rx="6.8" fill="#FCD34D"/>
        {/* Bubbles */}
        <circle cx="50" cy="55" r="2.5" fill="#fff" opacity="0.7">
          <animate attributeName="cy" values="55;44;55" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="55" cy="65" r="1.5" fill="#fff" opacity="0.5">
          <animate attributeName="cy" values="65;50;65" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        {/* Cap */}
        <rect x="40" y="10" width="20" height="8" rx="4" fill="#F59E0B"/>
      </g>
      {/* Heart */}
      <path d="M68 30 C68 26 72 24 74 26 C76 24 80 26 80 30 C80 34 74 40 74 40 C74 40 68 34 68 30Z"
        fill="#EF4444">
        <animate attributeName="transform" values="scale(1);scale(1.2);scale(1)"
          dur="1s" repeatCount="indefinite"
          attributeType="XML" additive="sum"/>
      </path>
      {/* Sparkle */}
      <line x1="24" y1="22" x2="24" y2="30" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="20" y1="26" x2="28" y2="26" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),

  Processing: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="50" cy="50" r="36" stroke="#DBEAFE" strokeWidth="6"/>
      {/* Spinning arc */}
      <circle cx="50" cy="50" r="36" stroke="#3B82F6" strokeWidth="6"
        strokeLinecap="round" strokeDasharray="60 160">
        <animateTransform attributeName="transform" type="rotate"
          from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      {/* Inner ring */}
      <circle cx="50" cy="50" r="22" stroke="#BFDBFE" strokeWidth="4"/>
      <circle cx="50" cy="50" r="22" stroke="#60A5FA" strokeWidth="4"
        strokeLinecap="round" strokeDasharray="30 110">
        <animateTransform attributeName="transform" type="rotate"
          from="360 50 50" to="0 50 50" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      {/* Center logo mark */}
      <circle cx="50" cy="50" r="10" fill="#3B82F6"/>
      <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">A+</text>
    </svg>
  ),

  "Report Ready": () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document */}
      <rect x="18" y="14" width="54" height="70" rx="6" fill="#fff" stroke="#F59E0B" strokeWidth="2.5"/>
      {/* Folded corner */}
      <path d="M58 14 L72 28 L58 28 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
      <path d="M58 14 L72 28 L58 28 Z" fill="#F59E0B" opacity="0.3"/>
      {/* Lines */}
      <rect x="26" y="38" width="36" height="3.5" rx="1.75" fill="#FDE68A"/>
      <rect x="26" y="48" width="28" height="3.5" rx="1.75" fill="#FDE68A"/>
      <rect x="26" y="58" width="32" height="3.5" rx="1.75" fill="#FDE68A"/>
      {/* Check badge */}
      <circle cx="72" cy="72" r="16" fill="#22C55E"/>
      <polyline points="64,72 70,78 82,62" stroke="#fff" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sparkle stars */}
      <g opacity="0.8">
        <line x1="14" y1="14" x2="14" y2="22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/>
        </line>
        <line x1="10" y1="18" x2="18" y2="18" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/>
        </line>
        <line x1="86" y1="24" x2="86" y2="30" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
        </line>
        <line x1="83" y1="27" x2="89" y2="27" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
        </line>
      </g>
    </svg>
  ),

  Cancelled: () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="36" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2.5"/>
      <line x1="34" y1="34" x2="66" y2="66" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round"/>
      <line x1="66" y1="34" x2="34" y2="66" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function StatusIllustration({ status, t }) {
  const def   = t.statuses[status] || t.statuses["Requested"];
  const IllSvg = illustrations[status] || illustrations["Requested"];
  const bg    = STATUS_BG[status] || "#E0F2FE";
  const anim  = def.anim || "anim-bob";

  // Phlebotomist name message (if Assigned)
  const msg = def.label === t.statuses["Assigned"]?.label && t.statuses["Assigned"]
    ? def.msg
    : def.msg;

  return (
    <div className="status-illustration">
      <div className={`illus-wrap ${anim}`}
        style={{ background: bg }}>
        <IllSvg />
      </div>
      <div className="status-title">{def.label}</div>
      <div className="status-msg">{msg}</div>
    </div>
  );
}
