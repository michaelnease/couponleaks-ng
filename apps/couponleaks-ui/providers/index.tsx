import ApolloProvider from '@/providers/apolloProvider';
import ChakraUIProvider from '@/providers/chakraProvider';

export default function index({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <ChakraUIProvider>{children}</ChakraUIProvider>
    </ApolloProvider>
  );
}
