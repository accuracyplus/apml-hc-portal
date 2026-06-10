// ═══════════════════════════════════════════════════════════════════════════
// WORKER ADDITIONS — PUBLIC HC ENDPOINTS
// Paste all 3 sections into worker.js at the marked positions.
// ═══════════════════════════════════════════════════════════════════════════

// ── SECTION 1: Add PUBLIC_PATHS whitelist ────────────────────────────────────
// Place BEFORE the existing X-App-Key auth check (around line that checks appKey)
// Replace:
//   const appKey = env.APML_APP_KEY;
//   if (appKey) {
//     const provided = request.headers.get("X-App-Key") || "";
//     if (provided !== appKey) { ... }
//   }
//
// With:

      const PUBLIC_PATHS = ["/hc-request", "/hc-status", "/health-check"];

      const appKey = env.APML_APP_KEY;
      if (appKey && !PUBLIC_PATHS.includes(path)) {
        const provided = request.headers.get("X-App-Key") || "";
        if (provided !== appKey) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401, headers: cors(request),
          });
        }
      }
      // Also bypass the X-API-Key check for public paths:
      // (wrap the existing expectedKey block the same way)
      // if (expectedKey && path !== "/health-check" && !PUBLIC_PATHS.includes(path)) { ... }


// ── SECTION 2: Update CORS ALLOWED set ──────────────────────────────────────
// Add the portal domain to the ALLOWED set at the top of the file:

const ALLOWED = new Set([
  "https://apml-tracker.pages.dev",
  "https://accuracyplus.github.io",
  "https://apml-hc-portal.pages.dev",   // ← ADD THIS LINE
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:5174",               // ← ADD (portal dev port)
]);


// ── SECTION 3: New route handlers ────────────────────────────────────────────
// Paste before the final `return fail("Not found", ...)` line.
// Uses the existing HC sheet + helpers from Session 3 (HC_HEADERS, hcToRow, etc.)

      // ── POST /hc-request  (PUBLIC — patient booking form) ────────────────
      if (meth === "POST" && path === "/hc-request") {
        const b = await request.json();
        if (!b.patient_name) return fail("patient_name required", request, 400);
        if (!b.contact)      return fail("contact required",      request, 400);
        if (!b.preferred_date) return fail("preferred_date required", request, 400);

        // Build the HC row using the extended schema (A→S)
        // Columns A–K are the base schema. L–S are the extended columns.
        // We use getOrCreateSheet so the sheet is created automatically if missing.
        const HC_EXTENDED_HEADERS = [
          "id","date","phlebotomist","area","patient_name","contact",
          "time_slot","status","revenue","notes","deleted",
          "tests_required","location_pin","confirmed_date","confirmed_time",
          "source","submitted_at","language","phlebotomist_phone",
        ];

        const values = await getOrCreateSheet(env, SHEET.hc, HC_EXTENDED_HEADERS);

        // Find next sequential HC ID (HC-0001 format)
        let max = 0;
        for (let i = 1; i < values.length; i++) {
          const m = String(values[i]?.[0] || "").match(/HC-(\d+)/i);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
        const id = `HC-${String(max + 1).padStart(4, "0")}`;

        const row = [
          id,                           // A  id
          b.preferred_date || "",       // B  date
          "",                           // C  phlebotomist (assigned by FO later)
          b.area || "",                 // D  area
          b.patient_name || "",         // E  patient_name
          b.contact || "",              // F  contact
          b.time_slot || "Morning",     // G  time_slot
          "Requested",                  // H  status
          "",                           // I  revenue
          b.notes || "",                // J  notes
          "",                           // K  deleted
          b.tests_required || "",       // L  tests_required
          b.location_pin || "",         // M  location_pin
          "",                           // N  confirmed_date
          "",                           // O  confirmed_time
          "patient",                    // P  source
          new Date().toISOString(),     // Q  submitted_at
          b.language || "en",           // R  language
          "",                           // S  phlebotomist_phone
        ];

        await appendRow(env, SHEET.hc, values, row);
        return json({ ok: true, id }, request);
      }

      // ── GET /hc-status?phone=&name=  (PUBLIC — patient tracking) ─────────
      if (meth === "GET" && path === "/hc-status") {
        const p     = new URL(request.url).searchParams;
        const phone = (p.get("phone") || "").trim().replace(/\s/g, "");
        const name  = (p.get("name")  || "").trim().toLowerCase();

        if (!phone || !name) return fail("phone and name required", request, 400);

        const { values } = await readSheet(env, SHEET.hc);
        let found = null;

        // Search most recent first — find latest non-deleted booking matching phone + name
        for (let i = values.length - 1; i >= 1; i--) {
          const r = values[i];
          if (!r || !r[0] || String(r[10] || "") === "1") continue; // skip deleted

          const rowPhone = String(r[5] || "").replace(/\s/g, "");
          const rowName  = String(r[4] || "").trim().toLowerCase();

          // Match: phone exact, name starts-with (handles "Ahmed" matching "Ahmed Al Ali")
          if (rowPhone === phone && rowName.startsWith(name)) {
            found = {
              id:                  String(r[0]  || ""),
              date:                excelDateToISO(r[1]),
              phlebotomist:        String(r[2]  || ""),
              area:                String(r[3]  || ""),
              patient_name:        String(r[4]  || ""),
              time_slot:           String(r[6]  || ""),
              status:              String(r[7]  || "Requested"),
              // Extended fields
              tests_required:      String(r[11] || ""),
              confirmed_date:      r[13] ? excelDateToISO(r[13]) : "",
              confirmed_time:      String(r[14] || ""),
              phlebotomist_phone:  String(r[18] || ""),
            };
            break;
          }
        }

        if (!found) return json({ ok: false, error: "not_found" }, request, 404);
        return json({ ok: true, booking: found }, request);
      }
