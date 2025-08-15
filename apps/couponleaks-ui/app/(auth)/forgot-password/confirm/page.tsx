'use client';

import { useState } from 'react';
import { confirmResetPassword } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfirmResetPage() {
  const sp = useSearchParams();
  const [username, setU] = useState(sp.get('username') || '');
  const [code, setC] = useState('');
  const [newPassword, setNP] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await confirmResetPassword({ username, confirmationCode: code, newPassword });
      router.push('/login');
    } catch (err: any) {
      setMsg(err?.message || 'Reset failed');
    }
  }

  return (
    <main>
      <h1>Set a new password</h1>
      <form onSubmit={onSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setU(e.target.value)} required />
        </label>
        <label>
          Code
          <input value={code} onChange={(e) => setC(e.target.value)} required />
        </label>
        <label>
          New password
          <input type="password" value={newPassword} onChange={(e) => setNP(e.target.value)} required />
        </label>
        <button type="submit">Save</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
