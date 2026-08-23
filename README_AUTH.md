# Authentication & Google OAuth setup

This branch adds a global route guard (Next.js middleware), a sample login page using @react-oauth/google, and a minimal API route to verify Google ID tokens.

Environment variables (add these in Vercel or your environment):

- NEXT_PUBLIC_GOOGLE_CLIENT_ID - public client id used by the frontend
- GOOGLE_CLIENT_ID - (optional) server-side client id used for verifying id_token
- GOOGLE_CLIENT_SECRET - (required if using auth-code exchange on the server)

Google Cloud Console checklist:

- Add your domain to Authorized domains (e.g. carlos69gmails3ll.vercel.app)
- If you use auth-code flow, add the backend redirect URI(s), for example:
  - https://carlos69gmails3ll.vercel.app/api/auth/google/code

Notes & Next steps:
- Replace the placeholder token creation in pages/api/auth/google.ts with your session creation or JWT signing logic.
- Consider storing session IDs in a server session store or signing JWTs with a secure secret.
- For production, ensure cookies use Secure and appropriate SameSite settings.
