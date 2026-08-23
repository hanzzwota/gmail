// components/GoogleAuthCodeButton.tsx
import { useGoogleLogin } from '@react-oauth/google';

export function GoogleAuthCodeButton() {
  const login = useGoogleLogin({
    flow: 'auth-code',
    // force the account chooser when opening the Google account selector
    prompt: 'select_account',
    onSuccess: async (codeResponse) => {
      // Send authorization code to backend to exchange for tokens server-side
      await fetch('/api/auth/google/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeResponse.code }),
      });
    },
    onError: () => console.log('Login failed'),
  });

  return <button onClick={() => login()}>Login dengan Google (server-side code)</button>;
}
