'use client';

import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLoading() {
  const { isRefreshing } = useAuth();

  if (!isRefreshing) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text color="white" fontSize="lg">
          Checking authentication...
        </Text>
      </VStack>
    </Box>
  );
}
