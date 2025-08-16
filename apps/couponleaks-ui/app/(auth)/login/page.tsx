'use client';

import { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [message, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('next') || '/account';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const out = await signIn({ username, password });
      const step = out.nextStep?.signInStep ?? 'DONE';

      if (step === 'CONFIRM_SIGN_UP') {
        router.push(
          `/signup/confirm?username=${encodeURIComponent(
            username
          )}&next=${encodeURIComponent(redirectTo)}`
        );
        return;
      }
      if (step === 'RESET_PASSWORD') {
        router.push(
          `/forgot-password?username=${encodeURIComponent(username)}`
        );
        return;
      }
      router.push(redirectTo);
    } catch (err: any) {
      setMsg(err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setU(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <p>
        <Link href="/signup">Create account</Link> ·{' '}
        <Link href="/forgot-password">Forgot password</Link>
      </p>
    </main>
  );
}
