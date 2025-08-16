'use client';

import { Avatar, Button, Menu, Portal } from '@chakra-ui/react';
import { LuCircleHelp, LuLogOut, LuSettings, LuUser } from 'react-icons/lu';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export const UserMenu = () => {
  const { isSignedOut } = useAuth();

  const handleLogout = async () => {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
    window.location.href = '/'; // redirect after logout
  };

  // Show sign-up/login buttons when not signed in
  if (isSignedOut) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="solid" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  // Show user menu when signed in
  return (
    <Menu.Root positioning={{ placement: 'bottom' }}>
      <Menu.Trigger rounded="full">
        <Avatar.Root>
          <Avatar.Fallback />
          <Avatar.Image src="https://i.pravatar.cc/300" />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="profile">
              <LuUser />
              Profile
            </Menu.Item>
            <Menu.Item value="settings">
              <LuSettings />
              Settings
            </Menu.Item>
            <Menu.Item value="help">
              <LuCircleHelp />
              Help & Support
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="logout" onClick={handleLogout}>
              <LuLogOut />
              Logout
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
