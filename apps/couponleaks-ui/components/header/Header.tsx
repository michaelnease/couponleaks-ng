'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';

type AuthState = 'unknown' | 'signed-in' | 'signed-out';

export function Header() {
  const [status, setStatus] = useState<AuthState>('unknown');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const hasTokens = Boolean(session?.tokens);
        if (hasTokens) {
          const user = await getCurrentUser().catch(() => null);
          if (!mounted) return;
          setStatus('signed-in');
          setUsername(user?.username ?? null);
        } else {
          if (!mounted) return;
          setStatus('signed-out');
        }
      } catch {
        if (!mounted) return;
        setStatus('signed-out');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      window.location.replace('/');
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
      }}
    >
      <Link href="/" style={{ fontWeight: 600, textDecoration: 'none' }}>
        CouponLeaks
      </Link>

      {status === 'unknown' ? (
        <span aria-busy="true">…</span>
      ) : status === 'signed-in' ? (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {username && (
            <Link href={`/${encodeURIComponent(username)}`}>@{username}</Link>
          )}
          <Link href="/account">Account</Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: '1px solid #ccc',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </nav>
      ) : (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </nav>
      )}
    </header>
  );
}
