// pages/api/auth/google.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

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
    if (!payload) return res.status(401).json({ error: 'Invalid token payload' });

    // Create or find the user in your database here using payload.sub / payload.email

    // Sign a JWT for session (server-side). Requires JWT_SECRET in environment.
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

    // Set httpOnly cookie with the token
    // Adjust cookie attributes (domain, secure, sameSite) according to your deployment
    const maxAge = 60 * 60 * 24; // 1 day
    res.setHeader('Set-Cookie', `token=${signedToken}; HttpOnly; Path=/; Secure; SameSite=Lax; Max-Age=${maxAge}`);

    res.status(200).json({ ok: true, user: { email: payload.email, name: payload.name } });
  } catch (err) {
    console.error('Invalid Google ID token', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}
