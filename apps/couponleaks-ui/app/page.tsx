// apps/couponleaks-ui/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Page() {
  const status = useStore((s) => s.auth.status);
  const username = useStore((s) => s.auth.username);
  const refresh = useStore((s) => s.auth.refresh);

  // optional: ensure auth state is fresh on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div>
      <p>CouponLeaks UI</p>
      <p>Status: {status}</p>
      {username && <p>User: @{username}</p>}
    </div>
  );
}
