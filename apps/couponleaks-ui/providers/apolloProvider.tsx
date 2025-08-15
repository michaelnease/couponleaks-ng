'use client';

import React from 'react';
import { AmplifyRuntime } from '../components/aws/AmplifyRuntime';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@couponleaks-ng/graphql';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmplifyRuntime />
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </>
  );
}
