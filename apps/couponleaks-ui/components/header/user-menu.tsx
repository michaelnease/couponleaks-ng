import { Avatar, Menu, Portal, Button } from '@chakra-ui/react';
import { LuCircleHelp, LuLogOut, LuSettings, LuUser } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';

export const UserMenu = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect to home page after logout
    window.location.href = '/';
  };

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
