function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type": "application/json", "Cache-Control": "no-store"}
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({error: "Registration service is not configured yet."}, 503);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({error: "Invalid request."}, 400); }

  const fields = ["first_name", "last_name", "email", "institution", "country", "academic_status"];
  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return json({error: "Please complete all required fields."}, 400);
    }
  }

  const clean = Object.fromEntries(fields.map(k => [k, body[k].trim()]));
  clean.phone = typeof body.phone === "string" ? body.phone.trim() : "";
  clean.email = clean.email.toLowerCase();

  if (clean.first_name.length > 80 || clean.last_name.length > 80 ||
      clean.email.length > 254 || clean.institution.length > 180 ||
      clean.country.length > 80 || clean.phone.length > 30 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return json({error: "Please check the information you entered."}, 400);
  }

  const allowed = ["Professor", "PhD Student", "Master Student", "Engineer", "Other"];
  if (!allowed.includes(clean.academic_status)) {
    return json({error: "Invalid academic status."}, 400);
  }

  const url = env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/registrations";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(clean)
  });

  if (response.status === 409 || response.status === 400) {
    const details = await response.text();
    if (details.includes("registrations_email_unique") || details.includes("duplicate key")) {
      return json({error: "This email address is already registered."}, 409);
    }
    return json({error: "The registration could not be saved. Please verify the form."}, 400);
  }
  if (!response.ok) return json({error: "Registration service temporarily unavailable."}, 502);

  const rows = await response.json();
  const row = rows[0];
  if (!row) return json({error: "No registration record was returned."}, 502);

  return json({
    registration_id: "ARCS26-" + row.id.slice(0, 8).toUpperCase(),
    qr_token: row.qr_token
  }, 201);
}