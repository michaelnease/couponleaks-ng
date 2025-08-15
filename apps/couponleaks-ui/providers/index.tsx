import ApolloProvider from '../providers/apolloProvider';

export default function index({ children }: { children: React.ReactNode }) {
  return <ApolloProvider>{children}</ApolloProvider>;
}
