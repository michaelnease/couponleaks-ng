'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useQuery, useMutation } from '@apollo/client';

// Update these import paths to match your package entry points
import { GET_PROFILE_BY_USERNAME } from '@couponleaks-ng/graphql';
import { UPDATE_PROFILE } from '@couponleaks-ng/graphql';

type FormState = {
  displayName: string;
  website: string;
  bio: string;
  avatarUrl: string;
};

export default function AccountPage() {
  const [username, setUsername] = useState<string | null>('michaelnease');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState<FormState>({
    displayName: '',
    website: '',
    bio: '',
    avatarUrl: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  // Determine auth and username
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser().catch(() => null);
        const session = await fetchAuthSession().catch(() => null);
        setUsername(user?.username ?? null);
        setIsLoggedIn(Boolean(session?.tokens));
      } catch {
        setUsername(null);
        setIsLoggedIn(false);
      }
    })();
  }, []);

  // Query current profile once we know the username
  const { data, loading, error, refetch } = useQuery(GET_PROFILE_BY_USERNAME, {
    variables: { username: username ?? '', isLoggedIn },
    skip: !username,
    fetchPolicy: 'cache-and-network',
  });

  console.log(error);

  // Seed the form from fetched profile
  useEffect(() => {
    const p = data?.getProfile;
    if (p) {
      setForm({
        displayName: p.displayName ?? '',
        website: p.website ?? '',
        bio: p.bio ?? '',
        avatarUrl: p.avatarUrl ?? '',
      });
    }
  }, [data?.getProfile?.username]); // run when profile loads/swaps

  const [mutate, { loading: saving }] = useMutation(UPDATE_PROFILE);

  const canSave = useMemo(
    () => Boolean(username && isLoggedIn),
    [username, isLoggedIn]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || !username) return;

    setStatus('Saving...');
    try {
      await mutate({
        variables: {
          username,
          input: {
            displayName: form.displayName,
            website: form.website,
            bio: form.bio,
            avatarUrl: form.avatarUrl,
          },
        },
      });
      setStatus('Saved');
      await refetch();
      setTimeout(() => setStatus(null), 1500);
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Save failed'}`);
    }
  }

  function onChange(
    key: keyof FormState
  ): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Account
      </h1>

      {!username && <p>Sign in to edit your profile.</p>}

      {username && (
        <>
          {loading && <p>Loading profile…</p>}
          {error && (
            <div
              style={{
                padding: 12,
                border: '1px solid #e11',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <strong>Error:</strong> {error.message}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Display name</span>
              <input
                value={form.displayName}
                onChange={onChange('displayName')}
                placeholder="Your name"
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Website</span>
              <input
                value={form.website}
                onChange={onChange('website')}
                placeholder="https://example.com"
                inputMode="url"
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Avatar URL</span>
              <input
                value={form.avatarUrl}
                onChange={onChange('avatarUrl')}
                placeholder="https://…"
                inputMode="url"
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Bio</span>
              <textarea
                value={form.bio}
                onChange={onChange('bio')}
                rows={4}
                placeholder="A few words about you"
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                }}
              />
            </label>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="submit"
                disabled={!canSave || saving}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #111',
                  background: '#111',
                  color: '#fff',
                  cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                  opacity: canSave && !saving ? 1 : 0.6,
                }}
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
              {status && <span>{status}</span>}
            </div>
          </form>

          <hr style={{ margin: '24px 0' }} />

          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Current profile
          </h2>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
            {JSON.stringify(data?.getProfile || null, null, 2)}
          </pre>

          <p style={{ marginTop: 16 }}>
            <a href="/logout">Log out</a>
          </p>
        </>
      )}
    </main>
  );
}
