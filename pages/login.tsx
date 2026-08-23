// pages/login.tsx
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import Router from 'next/router';
import Head from 'next/head';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
      const url = new URL(window.location.href);
      const from = url.searchParams.get('from') || '/dashboard';
      Router.replace(from);
    } else {
      console.error('Auth failed');
    }
  };

  // Use auth-code flow as the primary fallback because it reliably supports prompt=select_account
  const loginWithHook = useGoogleLogin({
    flow: 'auth-code',
    prompt: 'select_account',
    onSuccess: async (codeResponse) => {
      const code = (codeResponse as any).code;
      if (!code) {
        console.error('No code returned from auth-code flow', codeResponse);
        return;
      }

      const res = await fetch('/api/auth/google/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const url = new URL(window.location.href);
        const from = url.searchParams.get('from') || '/dashboard';
        Router.replace(from);
      } else {
        console.error('Auth failed (code exchange)');
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

      {googleClientId ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {
                console.log('Login Failed');
              }}
              // Keep discoverOauthParams but fallback to useGoogleLogin auth-code flow
              discoverOauthParams={{ prompt: 'select_account' }}
            />
          </div>

          <div>
            {/* Primary fallback: use auth-code hook which reliably supports prompt */}
            <button
              onClick={() => loginWithHook()}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Login dengan Google (force account chooser)
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 16 }}>
          Google login is currently disabled. Please use local authentication or contact the administrator to enable Google Sign-In.
        </div>
      )}

      <div style={{ marginTop: 16, color: '#666' }}>
        Note: if you still see automatic signin, clear Google cookies or test in Incognito. Also check for any Google One Tap initialization (google.accounts.id.initialize with auto_select: true) in the codebase and disable it.
      </div>
    </div>
  );
}
