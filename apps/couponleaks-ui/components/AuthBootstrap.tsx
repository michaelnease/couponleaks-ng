'use client';

import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { useAuth } from '@/hooks/useAuth';

export default function AuthBootstrap() {
  const { status, refresh } = useAuth();

  useEffect(() => {
    let mounted = true;

    if (status === 'unknown') {
      (async () => {
        await refresh();
      })();
    }

    const unsub = Hub.listen('auth', async () => {
      if (!mounted) return;
      await refresh();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [refresh, status]);

  // No UI, just bootstrap the auth state
  return null;
}
