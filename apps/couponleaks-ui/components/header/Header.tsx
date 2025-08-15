'use client';

import { Box, Container, HStack } from '@chakra-ui/react';
import { Logo } from './logo';
import { NotificationPopover } from './notificationPopover';
import { SearchField } from './searchField';
import { SearchPopover } from './searchPopover';
import { UserMenu } from './user-menu';
import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';

type AuthState = 'unknown' | 'signed-in' | 'signed-out';

export function Header() {
  const [status, setStatus] = useState<AuthState>('unknown');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const hasTokens = Boolean(session?.tokens);
        if (hasTokens) {
          const user = await getCurrentUser().catch(() => null);
          if (!mounted) return;
          setStatus('signed-in');
          setUsername(user?.username ?? null);
        } else {
          if (!mounted) return;
          setStatus('signed-out');
        }
      } catch {
        if (!mounted) return;
        setStatus('signed-out');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      window.location.replace('/');
    }
  }

  return (
    <header>
      <Box borderBottomWidth="1px" bg="bg.panel">
        <Container py={{ base: '3.5', md: '4' }}>
          <HStack justify="space-between">
            <Logo />
            <SearchField hideBelow="md" />
            <HStack gap={{ base: '2', md: '3' }}>
              <SearchPopover hideFrom="md" />
              <NotificationPopover />
              <UserMenu />
            </HStack>
          </HStack>
        </Container>
      </Box>
    </header>
  );
}
