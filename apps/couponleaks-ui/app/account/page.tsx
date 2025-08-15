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
