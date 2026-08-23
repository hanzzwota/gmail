// pages/api/auth/google/code.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g. https://your-domain.com/api/auth/google/code

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing Google OAuth env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const tokenResponse = await client.getToken(code);
    const tokens = tokenResponse.tokens;

    const idToken = tokens.id_token;
    if (!idToken) return res.status(401).json({ error: 'No ID token returned from Google' });

    // verify id_token
    const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid ID token payload' });

    // Create or find the user in your database here using payload.sub / payload.email

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET env variable');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const signedToken = jwt.sign(
      { sub: payload.sub, email: payload.email, name: payload.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const maxAge = 60 * 60 * 24; // 1 day
    res.setHeader('Set-Cookie', `token=${signedToken}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${maxAge}`);

    res.status(200).json({ ok: true, user: { email: payload.email, name: payload.name } });
  } catch (err) {
    console.error('Error exchanging code for tokens', err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
}
