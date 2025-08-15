'use client';

import { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfirmSignupPage() {
  const sp = useSearchParams();
  const [username, setU] = useState(sp.get('username') || '');
  const [code, setC] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const next = sp.get('next') || '/account';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await confirmSignUp({ username, confirmationCode: code });
      router.push(`/login?username=${encodeURIComponent(username)}&next=${encodeURIComponent(next)}`);
    } catch (err: any) {
      setMsg(err?.message || 'Confirmation failed');
    }
  }

  async function onResend() {
    setMsg(null);
    try {
      await resendSignUpCode({ username });
      setMsg('Code resent');
    } catch (err: any) {
      setMsg(err?.message || 'Could not resend');
    }
  }

  return (
    <main>
      <h1>Confirm your account</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setU(e.target.value)} required />
        </label>
        <label>
          Code
          <input value={code} onChange={(e) => setC(e.target.value)} required />
        </label>
        <button type="submit">Confirm</button>
        <button type="button" onClick={onResend}>Resend code</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
