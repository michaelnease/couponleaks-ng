'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@couponleaks-ng/graphql';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
