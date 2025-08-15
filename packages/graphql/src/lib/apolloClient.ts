import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const APPSYNC_URL = process.env.NEXT_PUBLIC_APPSYNC_URL ?? '';
const APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY ?? '';

const httpLink = new HttpLink({
  uri: APPSYNC_URL,
});

const authLink = setContext(async (_, { headers }) => {
  let token: string | undefined;

  try {
    // Dynamically import Amplify Auth for CSR
    const { getCurrentUser, fetchAuthSession } = await import(
      'aws-amplify/auth'
    );
    const user = await getCurrentUser().catch(() => null);

    if (user) {
      const session = await fetchAuthSession();
      token = session.tokens?.idToken?.toString();
    }
  } catch {
    // No Cognito session, fall back to API key
  }

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: token } : { 'x-api-key': APPSYNC_API_KEY }),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
