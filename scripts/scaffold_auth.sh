#!/usr/bin/env bash
set -euo pipefail

# Change this if your app path differs
APP_DIR="apps/couponleaks-ui"

echo "Scaffolding Cognito auth pages in $APP_DIR ..."

mkdir -p "$APP_DIR/app/(auth)/login"
mkdir -p "$APP_DIR/app/(auth)/signup/confirm"
mkdir -p "$APP_DIR/app/(auth)/forgot-password/confirm"
mkdir -p "$APP_DIR/app/(auth)/forgot-password"
mkdir -p "$APP_DIR/app/(auth)/logout"
mkdir -p "$APP_DIR/app/account"
mkdir -p "$APP_DIR/components"

# 1) Amplify runtime
cat > "$APP_DIR/components/AmplifyRuntime.tsx" <<'TSX'
'use client';

import { Amplify } from 'aws-amplify';
import { buildAmplifyConfig } from '@couponleaks/amplify-config';

let configured = false;

export default function AmplifyRuntime() {
  if (!configured) {
    Amplify.configure(buildAmplifyConfig());
    configured = true;
  }
  return null;
}
TSX

# 2) Route group layout for all auth pages
cat > "$APP_DIR/app/(auth)/layout.tsx" <<'TSX'
import AmplifyRuntime from '@/components/AmplifyRuntime';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmplifyRuntime />
      {children}
    </>
  );
}
TSX

# 3) /login
cat > "$APP_DIR/app/(auth)/login/page.tsx" <<'TSX'
'use client';

import { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';

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
        router.push(`/signup/confirm?username=${encodeURIComponent(username)}&next=${encodeURIComponent(redirectTo)}`);
        return;
      }
      if (step === 'RESET_PASSWORD') {
        router.push(`/forgot-password?username=${encodeURIComponent(username)}`);
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
          <input value={username} onChange={(e) => setU(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setP(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      {message && <p>{message}</p>}
      <p><a href="/signup">Create account</a> · <a href="/forgot-password">Forgot password</a></p>
    </main>
  );
}
TSX

# 4) /signup
cat > "$APP_DIR/app/(auth)/signup/page.tsx" <<'TSX'
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
TSX

# 5) /signup/confirm
cat > "$APP_DIR/app/(auth)/signup/confirm/page.tsx" <<'TSX'
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
TSX

# 6) /forgot-password
cat > "$APP_DIR/app/(auth)/forgot-password/page.tsx" <<'TSX'
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
TSX

# 7) /forgot-password/confirm
cat > "$APP_DIR/app/(auth)/forgot-password/confirm/page.tsx" <<'TSX'
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
TSX

# 8) /logout
cat > "$APP_DIR/app/(auth)/logout/page.tsx" <<'TSX'
'use client';

import { useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        await signOut();
      } finally {
        window.location.replace('/');
      }
    })();
  }, []);
  return <main><p>Signing out…</p></main>;
}
TSX

# 9) /account
cat > "$APP_DIR/app/account/page.tsx" <<'TSX'
'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export default function AccountPage() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser().catch(() => null);
        const session = await fetchAuthSession();
        setState({ user, tokens: Boolean(session?.tokens) });
      } catch (e) {
        setState({ error: 'Not signed in' });
      }
    })();
  }, []);

  return (
    <main>
      <h1>Account</h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <p><a href="/logout">Log out</a></p>
    </main>
  );
}
TSX

echo "Done. Pages created."
echo
echo "Next steps:"
echo "1) Ensure aws-amplify v6+ is installed: pnpm add aws-amplify"
echo "2) Ensure your @ alias points to the app root and amplify-config exists."
echo "3) Start dev server: pnpm dev"
