// pages/api/auth/google.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // TODO: create or find the user in your database using payload.email / payload.sub
    // Example payload fields: payload.sub (google id), payload.email, payload.name, payload.picture

    // TODO: create a server-side session or sign a JWT. Replace the placeholder below.
    const signedToken = 'REPLACE_WITH_YOUR_SIGNED_TOKEN_OR_SESSION_ID';

    // Set httpOnly cookie with the token
    // Adjust cookie attributes (domain, secure, sameSite) according to your deployment
    res.setHeader('Set-Cookie', `token=${signedToken}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24}`);

    res.status(200).json({ ok: true, user: { email: payload?.email, name: payload?.name } });
  } catch (err) {
    console.error('Invalid Google ID token', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}
