'use client';

import type { PropsWithChildren } from 'react';
import { ColorModeProvider } from '@/components/ui/colorMode';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
  globalCss: {
    body: { colorPalette: 'pink' },
  },
  theme: {
    tokens: {
      fonts: { body: { value: 'var(--font-inter)' } },
      colors: {
        bg: { value: '#ffffff' },
        fg: { value: '#171717' },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: '0.125rem' },
        l2: { value: '0.25rem' },
        l3: { value: '0.375rem' },
      },
    },
  },
});

type Props = PropsWithChildren<{ cookies?: string | null }>;

export default function ChakraUIProvider({ children }: Props) {
  return (
    <>
      <ColorModeProvider defaultTheme="system" />
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </>
  );
}
