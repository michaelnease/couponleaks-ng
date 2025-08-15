'use client';

import { useState } from 'react';
import { resetPassword } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const sp = useSearchParams();
  const [username, setU] = useState(sp.get('username') || '');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await resetPassword({ username });
      router.push(`/forgot-password/confirm?username=${encodeURIComponent(username)}`);
    } catch (err: any) {
      setMsg(err?.message || 'Request failed');
    }
  }

  return (
    <main>
      <h1>Reset password</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setU(e.target.value)} required />
        </label>
        <button type="submit">Send code</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
