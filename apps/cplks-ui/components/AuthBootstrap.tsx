'use client';

import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { useStore } from '@/lib/store';
import AmplifyRuntime from '@/components/AmplifyRuntime';

export default function AuthBootstrap() {
  const refresh = useStore((s) => s.auth.refresh);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
    })();

    const unsub = Hub.listen('auth', async () => {
      if (!mounted) return;
      await refresh();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [refresh]);

  // Ensure Amplify is configured once for the client
  return <AmplifyRuntime />;
}
