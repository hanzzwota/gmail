// pages/login.tsx
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
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

  // Fallback: use useGoogleLogin hook to force prompt if the <GoogleLogin /> discoverOauthParams isn't honored
  const loginWithHook = useGoogleLogin({
    flow: 'implicit', // use implicit flow to get id_token/credential in client (same behavior as GoogleLogin component)
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      // Depending on flow you may receive access_token or credential; the react-oauth returns credential in GoogleLogin
      // For the hook/implicit flow, tokenResponse may contain access_token; however we still send what we receive to backend for verification.
      const credential = (tokenResponse as any).credential || (tokenResponse as any).access_token || null;
      if (!credential) {
        console.error('No credential from hook login', tokenResponse);
        return;
      }
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (res.ok) {
        const url = new URL(window.location.href);
        const from = url.searchParams.get('from') || '/dashboard';
        Router.replace(from);
      } else {
        console.error('Auth failed (hook)');
      }
    },
    onError: () => console.error('Login failed (hook)'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
      <Head>
        <title>Login</title>
      </Head>
      <h1>Login</h1>
      <div style={{ marginBottom: 16 }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
          // Force account chooser so users must select an account every time
          // This adds the OAuth parameter prompt=select_account
          discoverOauthParams={{ prompt: 'select_account' }}
        />
      </div>

      <div>
        {/* Fallback button: if the component auto-selects, use this button which forces the prompt via useGoogleLogin hook */}
        <button
          onClick={() => loginWithHook()}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Login dengan Google (force account chooser)
        </button>
      </div>

      <div style={{ marginTop: 16, color: '#666' }}>
        Note: if you still see automatic signin, clear Google cookies or test in Incognito. Also check for any Google One Tap initialization (google.accounts.id.initialize with auto_select: true) in the codebase and disable it.
      </div>
    </div>
  );
}
