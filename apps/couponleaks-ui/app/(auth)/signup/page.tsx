'use client';

import { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [email, setE] = useState('');
  const [message, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/account';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await signUp({ username, password, options: { userAttributes: { email } } });
      router.push(`/signup/confirm?username=${encodeURIComponent(username)}&next=${encodeURIComponent(next)}`);
    } catch (err: any) {
      setMsg(err?.message || 'Sign up failed');
    }
  }

  return (
    <main>
      <h1>Sign up</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setU(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setE(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setP(e.target.value)} required />
        </label>
        <button type="submit">Create account</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
