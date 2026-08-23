// pages/login.tsx
import { GoogleLogin } from '@react-oauth/google';
import Router from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const handleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      console.error('No credential returned');
      return;
    }

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (res.ok) {
      // backend should set httpOnly cookie; redirect to original page or /dashboard
      const url = new URL(window.location.href);
      const from = url.searchParams.get('from') || '/dashboard';
      Router.replace(from);
    } else {
      console.error('Auth failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
      <Head>
        <title>Login</title>
      </Head>
      <h1>Login</h1>
      <div>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    </div>
  );
}
