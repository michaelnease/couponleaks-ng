'use client';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { fetchAuthSession } from 'aws-amplify/auth';

const APPSYNC_URL = process.env.NEXT_PUBLIC_APPSYNC_URL ?? '';
const APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

const httpLink = new HttpLink({ uri: APPSYNC_URL });

const authLink = setContext(async (_, { headers }) => {
  // Try Cognito first
  let idToken: string | undefined;
  try {
    const session = await fetchAuthSession();
    idToken = session?.tokens?.idToken?.toString();
  } catch {
    // not signed in or Amplify not configured yet
  }

  if (idToken) {
    return { headers: { ...headers, Authorization: idToken } };
  }

  // Fallback to API key for public reads
  const nextHeaders = { ...headers };
  if (APPSYNC_API_KEY) {
    nextHeaders['x-api-key'] = APPSYNC_API_KEY;
  } else {
    // optional: helpful during dev
    console.warn(
      'Missing NEXT_PUBLIC_APPSYNC_API_KEY. Public queries will fail when logged out.'
    );
  }
  return { headers: nextHeaders };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});
