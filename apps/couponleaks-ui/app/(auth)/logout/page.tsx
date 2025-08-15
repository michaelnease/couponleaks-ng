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
