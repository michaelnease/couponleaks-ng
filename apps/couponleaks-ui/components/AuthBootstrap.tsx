'use client';

import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { useAuth } from '@/hooks/useAuth';
import { AmplifyRuntime } from '@/components/aws/AmplifyRuntime';

export default function AuthBootstrap() {
  const { refresh } = useAuth();

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
