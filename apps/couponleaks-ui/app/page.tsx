// apps/couponleaks-ui/app/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const { status, isSignedIn, isSignedOut, isRefreshing, username, refresh } =
    useAuth();

  // optional: ensure auth state is fresh on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Box p={8}>
      <VStack gap={6} alignItems="start">
        <Heading>CouponLeaks UI</Heading>

        <Box>
          <Text fontWeight="bold">Authentication Status:</Text>
          <Text>Status: {status}</Text>
          <Text>Is Signed In: {isSignedIn ? 'Yes' : 'No'}</Text>
          <Text>Is Signed Out: {isSignedOut ? 'Yes' : 'No'}</Text>
          <Text>Is Refreshing: {isRefreshing ? 'Yes' : 'No'}</Text>
          {username && <Text>Username: @{username}</Text>}
        </Box>

        <Box>
          <Text fontWeight="bold">Actions:</Text>
          <Button onClick={() => refresh()} loading={isRefreshing} mt={2}>
            Refresh Auth State
          </Button>
        </Box>

        {isSignedOut && (
          <Box>
            <Text fontWeight="bold">Authentication Required:</Text>
            <Link href="/login">
              <Button style={{ color: 'blue', marginTop: '8px' }}>
                Sign In
              </Button>
            </Link>
          </Box>
        )}

        {isSignedIn && (
          <Box>
            <Text fontWeight="bold">Welcome back!</Text>
            <Link href="/account">
              <Button style={{ color: 'green', marginTop: '8px' }}>
                Go to Account
              </Button>
            </Link>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
