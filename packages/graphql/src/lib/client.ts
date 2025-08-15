import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const APPSYNC_URL = process.env.NEXT_PUBLIC_APPSYNC_URL!;
const APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY!;

/**
 * Retrieves the current Cognito JWT token using Amplify Auth.
 * Falls back to null if the user is not logged in or Amplify is not configured.
 */
async function getJwtToken(): Promise<string | null> {
  try {
    // Import from the correct subpath to avoid TS errors
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    if (!session?.tokens?.accessToken) return null;
    return session.tokens.accessToken.toString();
  } catch {
    return null;
  }
}

const httpLink = createHttpLink({
  uri: APPSYNC_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getJwtToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: token } : { 'x-api-key': APPSYNC_API_KEY }),
    },
  };
});

/**
 * Shared Apollo Client instance for CouponLeaks apps.
 * - Uses Cognito JWT when logged in
 * - Falls back to AppSync API key when logged out
 */
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
