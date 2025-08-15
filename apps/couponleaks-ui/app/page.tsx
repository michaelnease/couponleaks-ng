// apps/couponleaks-ui/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { selectAuthStatus, selectAuthUsername } from '@couponleaks-ng/store';

export default function Page() {
  const status = useStore(selectAuthStatus);
  const username = useStore(selectAuthUsername);
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
