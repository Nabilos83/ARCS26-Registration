# ARCS'26 Registration — starter deployment

This project contains a mobile-friendly registration page and a Cloudflare Pages Function that inserts registrations into Supabase. It does not yet include the protected admin dashboard, attendance scanner, or email confirmation.

## 1. Supabase
The SQL schema must already exist. In Supabase Project Settings → API, copy:
- Project URL
- `service_role` key (secret; never put it in browser code or share it)

## 2. Cloudflare Pages
Connect this project to a GitHub repository and deploy it as a Cloudflare Pages project.
- Framework preset: None
- Build command: leave empty
- Build output directory: `public`
- Root directory: `/`

The `functions/` directory must remain at the project root (beside `public/`) so Pages deploys the API function.

## 3. Environment variables
In Cloudflare Pages → project → Settings → Variables and Secrets, add for Production (and Preview if needed):
- `SUPABASE_URL` = Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase `service_role` key; mark as secret/encrypted

Redeploy after adding variables.

## 4. Test
Open the deployed site on a phone and submit a test registration using an email you control. Check Supabase Table Editor → `registrations`.

## Security notes
- Never expose the service-role key in HTML, JavaScript, screenshots, chat, or GitHub.
- Keep the admin and attendance endpoints protected; they are not part of this starter.
- Add CAPTCHA/rate limiting and a privacy notice before public launch.
